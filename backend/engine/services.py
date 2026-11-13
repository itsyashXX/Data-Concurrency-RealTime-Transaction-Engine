import time
import hashlib
import json
import uuid
import secrets
import threading
from decimal import Decimal
from django.db import transaction, DatabaseError
from django.utils import timezone
from .models import (
    Account,
    Transaction,
    LedgerEntry,
    IdempotencyKey,
    TransactionEvent,
    ConcurrencyExperiment,
    AuditLog
)
from .concurrency import (
    ConcurrencyStrategyHandler,
    ConcurrencyException,
    InsufficientFundsException,
    OptimisticLockConflictException
)

class IdempotencyException(Exception):
    def __init__(self, message, status_code=400, cached_response=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.cached_response = cached_response

class TransferService:
    """Core transaction execution service with double-entry ledger & idempotency protection."""

    @classmethod
    def execute_transfer(
        cls,
        user,
        sender_account_id,
        receiver_account_id,
        amount,
        description="",
        idempotency_key_value=None,
        strategy=Transaction.ConcurrencyStrategy.PESSIMISTIC,
        request_path="/api/transactions/"
    ):
        start_time = time.time()
        amount = Decimal(str(amount))

        if amount <= Decimal('0.00'):
            raise ValueError("Transfer amount must be strictly positive.")

        if str(sender_account_id) == str(receiver_account_id):
            raise ValueError("Cannot transfer to the same account.")

        # 1. Idempotency Check & Fingerprinting
        idempotency_obj = None
        if idempotency_key_value:
            payload_dict = {
                'sender': str(sender_account_id),
                'receiver': str(receiver_account_id),
                'amount': str(amount),
                'description': description
            }
            payload_str = json.dumps(payload_dict, sort_keys=True)
            payload_hash = hashlib.sha256(payload_str.encode('utf-8')).hexdigest()

            # Attempt to acquire or find existing idempotency record
            try:
                with transaction.atomic():
                    existing_key = IdempotencyKey.objects.select_for_update().filter(
                        user=user,
                        key=idempotency_key_value
                    ).first()

                    if existing_key:
                        # Check payload hash
                        if existing_key.request_hash != payload_hash:
                            raise IdempotencyException(
                                "Idempotency key reused with different request payload.",
                                status_code=400
                            )
                        if existing_key.status == IdempotencyKey.Status.COMPLETED:
                            # Return cached completed response
                            return existing_key.response_body, True
                        elif existing_key.status == IdempotencyKey.Status.PROCESSING:
                            raise IdempotencyException(
                                "Duplicate request currently in-flight. Please wait.",
                                status_code=409
                            )
                    else:
                        idempotency_obj = IdempotencyKey.objects.create(
                            user=user,
                            key=idempotency_key_value,
                            request_path=request_path,
                            request_hash=payload_hash,
                            status=IdempotencyKey.Status.PROCESSING
                        )
            except DatabaseError as dbe:
                # Handle race condition in concurrent key creation
                existing_key = IdempotencyKey.objects.filter(user=user, key=idempotency_key_value).first()
                if existing_key and existing_key.status == IdempotencyKey.Status.COMPLETED:
                    return existing_key.response_body, True
                raise IdempotencyException("Concurrent duplicate submission in progress.", status_code=409)

        # 2. Execute Transfer within Database Transaction
        tx = None
        event_logs = []

        def record_event(event_type, details):
            event_logs.append({'event_type': event_type, 'details': details, 'time': timezone.now().isoformat()})

        try:
            with transaction.atomic():
                # Verify sender ownership
                sender = Account.objects.get(id=sender_account_id)
                if sender.user != user and not (user.is_staff or user.role == 'ADMIN'):
                    raise PermissionError("User is not authorized to debit this account.")

                receiver = Account.objects.get(id=receiver_account_id)

                # Initialize transaction record
                tx = Transaction.objects.create(
                    sender_account=sender,
                    receiver_account=receiver,
                    amount=amount,
                    currency=sender.currency,
                    status=Transaction.Status.PENDING,
                    concurrency_strategy=strategy,
                    idempotency_key=idempotency_key_value,
                    description=description
                )

                record_event('TX_CREATED', {'tx_id': str(tx.id), 'strategy': strategy})

                # Dispatch Concurrency Strategy
                if strategy == Transaction.ConcurrencyStrategy.PESSIMISTIC:
                    sender, receiver = ConcurrencyStrategyHandler.execute_pessimistic(
                        sender.id, receiver.id, amount, event_callback=record_event
                    )
                elif strategy == Transaction.ConcurrencyStrategy.OPTIMISTIC:
                    sender, receiver = ConcurrencyStrategyHandler.execute_optimistic(
                        sender.id, receiver.id, amount, event_callback=record_event
                    )
                elif strategy == Transaction.ConcurrencyStrategy.ATOMIC_CONDITIONAL:
                    sender, receiver = ConcurrencyStrategyHandler.execute_atomic_conditional(
                        sender.id, receiver.id, amount, event_callback=record_event
                    )
                elif strategy == Transaction.ConcurrencyStrategy.UNSAFE_BASELINE:
                    sender, receiver = ConcurrencyStrategyHandler.execute_unsafe_baseline(
                        sender.id, receiver.id, amount, event_callback=record_event
                    )
                else:
                    raise ValueError(f"Unknown concurrency strategy: {strategy}")

                # 3. Create Immutable Double-Entry Ledger Entries
                # DEBIT sender
                debit_entry = LedgerEntry.objects.create(
                    transaction=tx,
                    account=sender,
                    entry_type=LedgerEntry.EntryType.DEBIT,
                    amount=amount,
                    balance_after=sender.balance,
                    description=f"Transfer to {receiver.account_number}: {description}"
                )
                # CREDIT receiver
                credit_entry = LedgerEntry.objects.create(
                    transaction=tx,
                    account=receiver,
                    entry_type=LedgerEntry.EntryType.CREDIT,
                    amount=amount,
                    balance_after=receiver.balance,
                    description=f"Transfer from {sender.account_number}: {description}"
                )

                record_event('LEDGER_COMMITTED', {
                    'debit_entry_id': str(debit_entry.id),
                    'credit_entry_id': str(credit_entry.id),
                    'amount': str(amount),
                    'sender_balance_after': str(sender.balance),
                    'receiver_balance_after': str(receiver.balance)
                })

                # Mark transaction COMPLETED
                latency = round((time.time() - start_time) * 1000, 2)
                tx.status = Transaction.Status.COMPLETED
                tx.completed_at = timezone.now()
                tx.latency_ms = latency
                tx.save(update_fields=['status', 'completed_at', 'latency_ms'])

                record_event('TX_COMPLETED', {'latency_ms': latency})

                # Persist Transaction Events
                for ev in event_logs:
                    TransactionEvent.objects.create(
                        transaction=tx,
                        event_type=ev['event_type'],
                        details=ev['details']
                    )

            # Build successful response dictionary
            response_payload = {
                "id": str(tx.id),
                "sender_account": sender.account_number,
                "receiver_account": receiver.account_number,
                "amount": str(amount),
                "currency": tx.currency,
                "status": tx.status,
                "concurrency_strategy": tx.concurrency_strategy,
                "idempotency_key": tx.idempotency_key,
                "sender_balance_after": str(sender.balance),
                "latency_ms": tx.latency_ms,
                "created_at": tx.created_at.isoformat(),
                "completed_at": tx.completed_at.isoformat() if tx.completed_at else None,
            }

            # Update Idempotency Record on Success
            if idempotency_obj:
                idempotency_obj.status = IdempotencyKey.Status.COMPLETED
                idempotency_obj.response_code = 201
                idempotency_obj.response_body = response_payload
                idempotency_obj.save(update_fields=['status', 'response_code', 'response_body', 'updated_at'])

            return response_payload, False

        except Exception as e:
            # Handle Failure / Rollback
            latency = round((time.time() - start_time) * 1000, 2)
            if tx and tx.id:
                try:
                    with transaction.atomic():
                        tx_record = Transaction.objects.get(id=tx.id)
                        tx_record.status = Transaction.Status.FAILED
                        tx_record.failure_reason = str(e)
                        tx_record.latency_ms = latency
                        tx_record.save(update_fields=['status', 'failure_reason', 'latency_ms'])
                        TransactionEvent.objects.create(
                            transaction=tx_record,
                            event_type='TX_FAILED',
                            details={'error': str(e), 'latency_ms': latency}
                        )
                except Exception:
                    pass

            if idempotency_obj:
                idempotency_obj.status = IdempotencyKey.Status.FAILED
                idempotency_obj.response_code = 400
                idempotency_obj.response_body = {"error": str(e)}
                idempotency_obj.save(update_fields=['status', 'response_code', 'response_body', 'updated_at'])

            raise e


class RaceExperimentService:
    """Executes controlled multi-threaded race-condition experiments in isolated lab sandbox."""

    @classmethod
    def run_experiment(cls, admin_user, strategy, initial_balance=1000.0, withdrawals=(700.0, 500.0)):
        start_time = time.time()
        initial_balance = Decimal(str(initial_balance))
        withdrawals = [Decimal(str(w)) for w in withdrawals]
        
        # 1. Create isolated sandbox experiment accounts
        exp_id = uuid.uuid4()
        test_sender = Account.objects.create(
            user=admin_user,
            account_number=f"LAB-SRC-{secrets.randbelow(9000)+1000}",
            balance=initial_balance,
            currency='INR'
        )
        test_receiver = Account.objects.create(
            user=admin_user,
            account_number=f"LAB-DST-{secrets.randbelow(9000)+1000}",
            balance=Decimal('0.00'),
            currency='INR'
        )

        logs = []
        threads = []
        results = []

        def worker(thread_idx, amount):
            log_entry = {
                'thread': thread_idx,
                'requested_amount': str(amount),
                'status': 'STARTED',
                'timestamp': timezone.now().isoformat()
            }
            try:
                # Direct invocation of strategy (Unsafe baseline runs without atomic transaction)
                if strategy == Transaction.ConcurrencyStrategy.UNSAFE_BASELINE:
                    s, r = ConcurrencyStrategyHandler.execute_unsafe_baseline(test_sender.id, test_receiver.id, amount)
                else:
                    with transaction.atomic():
                        if strategy == Transaction.ConcurrencyStrategy.PESSIMISTIC:
                            s, r = ConcurrencyStrategyHandler.execute_pessimistic(test_sender.id, test_receiver.id, amount)
                        elif strategy == Transaction.ConcurrencyStrategy.OPTIMISTIC:
                            s, r = ConcurrencyStrategyHandler.execute_optimistic(test_sender.id, test_receiver.id, amount)
                        elif strategy == Transaction.ConcurrencyStrategy.ATOMIC_CONDITIONAL:
                            s, r = ConcurrencyStrategyHandler.execute_atomic_conditional(test_sender.id, test_receiver.id, amount)
                        else:
                            raise ValueError(f"Unknown strategy: {strategy}")

                log_entry['status'] = 'SUCCESS'
                log_entry['message'] = f"Successfully debited {amount}"
                results.append((True, amount))
            except Exception as exc:
                log_entry['status'] = 'REJECTED'
                log_entry['message'] = str(exc)
                results.append((False, str(exc)))
            logs.append(log_entry)

        # Launch concurrent threads simultaneously
        for i, amt in enumerate(withdrawals):
            t = threading.Thread(target=worker, args=(i + 1, amt))
            threads.append(t)

        for t in threads:
            t.start()
        for t in threads:
            t.join()

        duration = round((time.time() - start_time) * 1000, 2)
        test_sender.refresh_from_db()
        test_receiver.refresh_from_db()

        # Invariant checks:
        # Invariant 1: Sender balance must be non-negative
        # Invariant 2: Total test money conserved: sender + receiver == initial_balance
        non_negative = test_sender.balance >= Decimal('0.00')
        conserved = (test_sender.balance + test_receiver.balance) == initial_balance
        invariants_preserved = non_negative and conserved

        successful_count = sum(1 for success, _ in results if success)
        failed_count = sum(1 for success, _ in results if not success)

        expected_balance = initial_balance - (withdrawals[0] if successful_count == 1 else (sum(withdrawals) if successful_count == 2 else Decimal('0.00')))
        if expected_balance < Decimal('0.00'):
            expected_balance = Decimal('0.00')

        experiment = ConcurrencyExperiment.objects.create(
            id=exp_id,
            experiment_name=f"Race Test: {strategy} with ₹{initial_balance} & {withdrawals}",
            strategy=strategy,
            initial_balance=initial_balance,
            concurrent_requests_count=len(withdrawals),
            successful_count=successful_count,
            failed_count=failed_count,
            final_balance=test_sender.balance,
            expected_balance=expected_balance,
            invariants_preserved=invariants_preserved,
            duration_ms=duration,
            logs=logs
        )

        return experiment
