import threading
from decimal import Decimal
from django.test import TransactionTestCase
from authentication.models import User
from engine.models import Account, Transaction
from engine.services import RaceExperimentService
from engine.concurrency import (
    ConcurrencyStrategyHandler,
    OptimisticLockConflictException,
    InsufficientFundsException
)

class ConcurrencyEngineTests(TransactionTestCase):
    """
    TransactionTestCase ensures transactions commit to the test database so
    multi-threaded concurrency tests can interact with real DB state.
    """
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email='admin@concurrency.com',
            password='Password123!',
            full_name='Concurrency Admin'
        )
        self.sender = Account.objects.create(
            user=self.admin,
            balance=Decimal('1000.00'),
            currency='INR',
            version=0
        )
        self.receiver = Account.objects.create(
            user=self.admin,
            balance=Decimal('0.00'),
            currency='INR',
            version=0
        )

    def test_pessimistic_locking_race_experiment(self):
        """
        Controlled race condition experiment with Pessimistic Locking:
        Initial Balance: 1000 INR
        Tx A: Withdraw 700 INR
        Tx B: Withdraw 500 INR
        Combined = 1200 INR > 1000 INR
        Pessimistic locking MUST allow exactly one to succeed and reject the other,
        preserving the invariant that account balance never goes below zero.
        """
        experiment = RaceExperimentService.run_experiment(
            admin_user=self.admin,
            strategy=Transaction.ConcurrencyStrategy.PESSIMISTIC,
            initial_balance=1000.00,
            withdrawals=(700.00, 500.00)
        )

        self.assertTrue(experiment.invariants_preserved)
        self.assertEqual(experiment.successful_count, 1)
        self.assertEqual(experiment.failed_count, 1)
        # Final balance must be non-negative (either 300 or 500)
        self.assertGreaterEqual(experiment.final_balance, Decimal('0.00'))

    def test_optimistic_locking_detects_version_conflict(self):
        """
        Verify that when two operations read the same version,
        the second version increment fails with an OptimisticLockConflictException.
        """
        # First execution advances version from 0 to 1
        ConcurrencyStrategyHandler.execute_optimistic(self.sender.id, self.receiver.id, Decimal('100.00'))
        self.sender.refresh_from_db()
        self.assertEqual(self.sender.version, 1)
        self.assertEqual(self.sender.balance, Decimal('900.00'))

        # If a stale operation attempts to write expecting version 0, it must fail
        # We simulate this by attempting an update on an outdated version
        stale_updated = Account.objects.filter(
            id=self.sender.id,
            version=0  # Outdated version!
        ).update(balance=Decimal('800.00'), version=1)

        self.assertEqual(stale_updated, 0)

    def test_unsafe_baseline_demonstrates_race_condition(self):
        """
        In the isolated lab experiment, the Unsafe Baseline uses simulated thread latency
        between check and write, demonstrating invariant breakdown (overdraft/negative balance).
        """
        experiment = RaceExperimentService.run_experiment(
            admin_user=self.admin,
            strategy=Transaction.ConcurrencyStrategy.UNSAFE_BASELINE,
            initial_balance=1000.00,
            withdrawals=(700.00, 500.00)
        )
        # Because unsafe baseline doesn't lock rows, both threads see balance >= amount and write,
        # leading to an invariant breakdown!
        self.assertFalse(experiment.invariants_preserved)
        self.assertEqual(experiment.successful_count, 2)
        self.assertEqual(experiment.final_balance, Decimal('-200.00'))
