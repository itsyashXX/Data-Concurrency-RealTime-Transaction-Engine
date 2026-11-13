from django.contrib import admin
from .models import (
    Account,
    Transaction,
    LedgerEntry,
    IdempotencyKey,
    TransactionEvent,
    ConcurrencyExperiment,
    AuditLog
)

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('account_number', 'user', 'balance', 'currency', 'version', 'is_active', 'created_at')
    search_fields = ('account_number', 'user__email')
    list_filter = ('currency', 'is_active')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender_account', 'receiver_account', 'amount', 'currency', 'status', 'concurrency_strategy', 'latency_ms', 'created_at')
    search_fields = ('id', 'sender_account__account_number', 'receiver_account__account_number', 'idempotency_key')
    list_filter = ('status', 'concurrency_strategy')

@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'transaction', 'account', 'entry_type', 'amount', 'balance_after', 'created_at')
    list_filter = ('entry_type',)
    search_fields = ('account__account_number',)

@admin.register(IdempotencyKey)
class IdempotencyKeyAdmin(admin.ModelAdmin):
    list_display = ('key', 'user', 'status', 'response_code', 'created_at')
    search_fields = ('key', 'user__email')
    list_filter = ('status',)

@admin.register(TransactionEvent)
class TransactionEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'transaction', 'event_type', 'created_at')
    list_filter = ('event_type',)

@admin.register(ConcurrencyExperiment)
class ConcurrencyExperimentAdmin(admin.ModelAdmin):
    list_display = ('experiment_name', 'strategy', 'initial_balance', 'successful_count', 'failed_count', 'final_balance', 'invariants_preserved', 'duration_ms', 'created_at')
    list_filter = ('strategy', 'invariants_preserved')

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'action', 'user', 'ip_address')
    list_filter = ('action',)
    search_fields = ('action', 'user__email')
