import json
import time
from decimal import Decimal
from datetime import timedelta
from django.db import models
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from django.http import StreamingHttpResponse
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import (
    Account,
    Transaction,
    LedgerEntry,
    IdempotencyKey,
    TransactionEvent,
    ConcurrencyExperiment,
    AuditLog
)
from .serializers import (
    AccountSerializer,
    TransactionSerializer,
    TransferRequestSerializer,
    LedgerEntrySerializer,
    TransactionEventSerializer,
    ConcurrencyExperimentSerializer,
    RunExperimentRequestSerializer,
    AuditLogSerializer,
    IdempotencyKeySerializer
)
from .permissions import IsAdminUserRole, IsAccountOwner
from .services import TransferService, RaceExperimentService, IdempotencyException
from authentication.models import User

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# =========================================================================
# Customer Endpoints
# =========================================================================

class AccountListView(generics.ListAPIView):
    """List authenticated user's active ledger accounts."""
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Account.objects.filter(user=self.request.user, is_active=True)


class AccountDetailView(generics.RetrieveAPIView):
    """Retrieve details of a specific account."""
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == User.Role.ADMIN or self.request.user.is_staff:
            return Account.objects.all()
        return Account.objects.filter(user=self.request.user)


class TransactionView(APIView):
    """
    POST: Execute a fund transfer with concurrency and idempotency guarantees.
    GET: List authenticated user's recent transactions.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        user_accounts = Account.objects.filter(user=user).values_list('id', flat=True)
        txs = Transaction.objects.filter(
            Q(sender_account__in=user_accounts) | Q(receiver_account__in=user_accounts)
        ).select_related('sender_account', 'receiver_account', 'sender_account__user', 'receiver_account__user')[:20]
        serializer = TransactionSerializer(txs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TransferRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        # Resolve sender account (default to user's primary active account if not specified)
        sender_id = validated_data.get('sender_account_id')
        if not sender_id:
            primary_account = Account.objects.filter(user=request.user, is_active=True).first()
            if not primary_account:
                return Response({"detail": "User has no active account to transfer from."}, status=status.HTTP_400_BAD_REQUEST)
            sender_id = primary_account.id

        receiver_account_id = validated_data['receiver_identifier']
        amount = validated_data['amount']
        description = validated_data.get('description', '')
        strategy = validated_data.get('concurrency_strategy', Transaction.ConcurrencyStrategy.PESSIMISTIC)

        # Idempotency key from header or body
        idempotency_key = (
            request.headers.get('Idempotency-Key') or
            request.headers.get('X-Idempotency-Key') or
            request.data.get('idempotency_key')
        )

        try:
            tx_data, is_cached = TransferService.execute_transfer(
                user=request.user,
                sender_account_id=sender_id,
                receiver_account_id=receiver_account_id,
                amount=amount,
                description=description,
                idempotency_key_value=idempotency_key,
                strategy=strategy,
                request_path=request.path
            )
            resp_status = status.HTTP_200_OK if is_cached else status.HTTP_201_CREATED
            return Response(tx_data, status=resp_status)

        except IdempotencyException as ie:
            return Response({"detail": ie.message}, status=ie.status_code)
        except PermissionError as pe:
            return Response({"detail": str(pe)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as ve:
            return Response({"detail": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as ex:
            return Response({"detail": str(ex)}, status=status.HTTP_400_BAD_REQUEST)


class TransactionDetailView(generics.RetrieveAPIView):
    """Retrieve full transaction details including ledger entries."""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN or user.is_staff:
            return Transaction.objects.all().select_related(
                'sender_account', 'receiver_account', 'sender_account__user', 'receiver_account__user'
            ).prefetch_related('ledger_entries')

        user_accounts = Account.objects.filter(user=user).values_list('id', flat=True)
        return Transaction.objects.filter(
            Q(sender_account__in=user_accounts) | Q(receiver_account__in=user_accounts)
        ).select_related(
            'sender_account', 'receiver_account', 'sender_account__user', 'receiver_account__user'
        ).prefetch_related('ledger_entries')


class TransactionHistoryView(generics.ListAPIView):
    """Paginated transaction history for the authenticated customer."""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        user = self.request.user
        user_accounts = Account.objects.filter(user=user).values_list('id', flat=True)
        return Transaction.objects.filter(
            Q(sender_account__in=user_accounts) | Q(receiver_account__in=user_accounts)
        ).select_related(
            'sender_account', 'receiver_account', 'sender_account__user', 'receiver_account__user'
        ).order_by('-created_at')


class CustomerEventsView(APIView):
    """Returns lifecycle events for transactions involving the authenticated customer."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_accounts = Account.objects.filter(user=request.user).values_list('id', flat=True)
        events = TransactionEvent.objects.filter(
            Q(transaction__sender_account__in=user_accounts) |
            Q(transaction__receiver_account__in=user_accounts)
        ).order_by('-created_at')[:50]
        return Response(TransactionEventSerializer(events, many=True).data)


class EventStreamView(APIView):
    """Server-Sent Events (SSE) streaming live transactions and concurrency events."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        def event_stream():
            last_check = timezone.now() - timedelta(seconds=10)
            # Send initial keep-alive ping
            yield f"data: {json.dumps({'type': 'PING', 'timestamp': timezone.now().isoformat()})}\n\n"

            # Stream up to 30 intervals (30 seconds)
            for _ in range(15):
                time.sleep(2)
                now = timezone.now()
                new_events = TransactionEvent.objects.filter(created_at__gte=last_check).order_by('created_at')
                for ev in new_events:
                    payload = {
                        'type': 'EVENT',
                        'event_type': ev.event_type,
                        'details': ev.details,
                        'created_at': ev.created_at.isoformat()
                    }
                    yield f"data: {json.dumps(payload)}\n\n"
                last_check = now

        response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response


# =========================================================================
# Administrator Endpoints
# =========================================================================

class AdminOverviewView(APIView):
    """Platform-wide operational, concurrency and financial consistency overview."""
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        now = timezone.now()
        active_threshold = now - timedelta(minutes=5)
        last_hour = now - timedelta(hours=1)

        total_users = User.objects.count()
        active_users = User.objects.filter(last_heartbeat__gte=active_threshold).count()

        tx_stats = Transaction.objects.aggregate(
            total_count=Count('id'),
            completed_count=Count('id', filter=Q(status=Transaction.Status.COMPLETED)),
            failed_count=Count('id', filter=Q(status=Transaction.Status.FAILED)),
            avg_latency=Avg('latency_ms')
        )

        duplicates_rejected = IdempotencyKey.objects.filter(
            status=IdempotencyKey.Status.COMPLETED
        ).count()

        throughput_last_hour = Transaction.objects.filter(created_at__gte=last_hour).count()

        # Double-entry ledger audit invariant check:
        # Sum of debits across all accounts must equal sum of credits across all accounts
        total_debits = LedgerEntry.objects.filter(
            entry_type=LedgerEntry.EntryType.DEBIT
        ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')

        total_credits = LedgerEntry.objects.filter(
            entry_type=LedgerEntry.EntryType.CREDIT
        ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')

        # Total test money currently in all accounts
        total_balance = Account.objects.aggregate(sum=Sum('balance'))['sum'] or Decimal('0.00')

        ledger_balanced = abs(total_debits - (total_credits - total_balance)) < Decimal('0.01') or (total_debits == total_credits)

        return Response({
            "metrics": {
                "total_users": total_users,
                "active_users": active_users,
                "total_transactions": tx_stats['total_count'] or 0,
                "completed_transactions": tx_stats['completed_count'] or 0,
                "failed_transactions": tx_stats['failed_count'] or 0,
                "duplicate_requests_handled": duplicates_rejected,
                "throughput_last_hour": throughput_last_hour,
                "average_latency_ms": round(tx_stats['avg_latency'] or 0.0, 2),
            },
            "financial_consistency": {
                "total_system_balance": str(total_balance),
                "total_ledger_debits": str(total_debits),
                "total_ledger_credits": str(total_credits),
                "ledger_invariants_balanced": ledger_balanced
            }
        })


class AdminUsersListView(generics.ListAPIView):
    """List all registered users with account numbers, balances and transaction counts."""
    permission_classes = [IsAdminUserRole]
    pagination_class = StandardPagination

    def get(self, request):
        users = User.objects.all().prefetch_related('accounts').order_by('-date_joined')
        data = []
        for u in users:
            accounts_data = [
                {"account_number": acc.account_number, "balance": str(acc.balance), "currency": acc.currency}
                for acc in u.accounts.all()
            ]
            tx_count = Transaction.objects.filter(
                Q(sender_account__user=u) | Q(receiver_account__user=u)
            ).count()
            data.append({
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "is_active": u.is_active,
                "date_joined": u.date_joined.isoformat(),
                "last_heartbeat": u.last_heartbeat.isoformat(),
                "accounts": accounts_data,
                "total_transactions": tx_count
            })
        return Response(data)


class AdminTransactionsListView(generics.ListAPIView):
    """Platform-wide live transaction monitor."""
    permission_classes = [IsAdminUserRole]
    serializer_class = TransactionSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Transaction.objects.all().select_related(
            'sender_account', 'receiver_account', 'sender_account__user', 'receiver_account__user'
        ).order_by('-created_at')

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param.upper())
        strategy_param = self.request.query_params.get('strategy')
        if strategy_param:
            qs = qs.filter(concurrency_strategy=strategy_param.upper())

        return qs


class AdminMetricsView(APIView):
    """Detailed analytics on concurrency performance, strategy distribution, and latency."""
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        strategy_counts = Transaction.objects.values('concurrency_strategy').annotate(
            count=Count('id'),
            avg_latency=Avg('latency_ms')
        )
        status_counts = Transaction.objects.values('status').annotate(count=Count('id'))

        return Response({
            "by_strategy": list(strategy_counts),
            "by_status": list(status_counts),
        })


class AdminConcurrencyMonitorView(APIView):
    """Live monitor of concurrency events, lock acquisitions, and race detections."""
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        events = TransactionEvent.objects.all().order_by('-created_at')[:100]
        return Response(TransactionEventSerializer(events, many=True).data)


class AdminExperimentsView(APIView):
    """
    Race-Condition Laboratory:
    GET: List past controlled experiments.
    POST: Run a new experiment with specified concurrency strategy.
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        experiments = ConcurrencyExperiment.objects.all().order_by('-created_at')[:20]
        return Response(ConcurrencyExperimentSerializer(experiments, many=True).data)

    def post(self, request):
        serializer = RunExperimentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        strategy = serializer.validated_data['strategy']
        initial_balance = serializer.validated_data['initial_balance']
        withdrawals = serializer.validated_data['withdrawals']

        experiment = RaceExperimentService.run_experiment(
            admin_user=request.user,
            strategy=strategy,
            initial_balance=initial_balance,
            withdrawals=withdrawals
        )

        return Response(ConcurrencyExperimentSerializer(experiment).data, status=status.HTTP_201_CREATED)


class AdminAuditLogsView(generics.ListAPIView):
    """Filterable system-wide audit logs."""
    permission_classes = [IsAdminUserRole]
    serializer_class = AuditLogSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = AuditLog.objects.all().select_related('user').order_by('-timestamp')
        action = self.request.query_params.get('action')
        if action:
            qs = qs.filter(action=action)
        return qs


class AdminDuplicateDetectionView(generics.ListAPIView):
    """Monitor duplicate request detection and idempotency keys."""
    permission_classes = [IsAdminUserRole]
    serializer_class = IdempotencyKeySerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return IdempotencyKey.objects.all().select_related('user').order_by('-created_at')
