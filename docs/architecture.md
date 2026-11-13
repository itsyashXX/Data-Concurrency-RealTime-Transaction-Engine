# DataCore System Architecture

## 1. Executive Summary
**DataCore** is an enterprise-grade financial engineering platform designed to demonstrate real-time database concurrency control, race-condition prevention, duplicate transaction suppression via idempotency keys, and mathematical data consistency through double-entry bookkeeping.

The system features two clients communicating with a centralized Django REST Framework backend and a single authoritative PostgreSQL database:
1. **Customer Mobile Application (Flutter):** End-user registration, account balance inspection, test-fund transfers, and transaction history.
2. **Admin Dashboard (React + TypeScript + Vite):** Comprehensive platform observability, live transaction monitoring, concurrency event tracing, and an interactive Race-Condition Laboratory.

```
                    GITHUB MONOREPO
                           |
             +-------------+-------------+
             |                           |
       FLUTTER APP                 REACT ADMIN
       Android APK                    Vercel
             |                           |
             +-------------+-------------+
                           |
                    HTTPS REST API
                           |
                 DJANGO REST FRAMEWORK
                   ONE RENDER SERVICE
                           |
                       POSTGRESQL
                  ONE MANAGED DATABASE
```

---

## 2. Concurrency Control Strategies

### 2.1 Pessimistic Row Locking (`SELECT FOR UPDATE`)
- **Mechanism:** Acquires exclusive database-level row locks on involved accounts inside an atomic transaction (`transaction.atomic()`).
- **Deadlock Prevention:** Accounts are sorted and locked in a canonical order (by UUID primary key: `first_id, second_id = min(s, r), max(s, r)`).
- **Guarantees:** Completely serializes concurrent transfers on shared accounts. Invariant `balance >= 0` is guaranteed.

### 2.2 Optimistic Locking with Versioning
- **Mechanism:** Each account maintains an integer `version` field. Updates perform a conditional write:
  ```sql
  UPDATE engine_account
  SET balance = balance - :amount, version = version + 1
  WHERE id = :id AND version = :initial_version;
  ```
- **Guarantees:** If another thread modified the account concurrently, `rowcount == 0` is returned, raising `OptimisticLockConflictException` and triggering a clean rollback.

### 2.3 Atomic Conditional Updates
- **Mechanism:** Uses Django's `F()` expressions with filter guards:
  ```python
  Account.objects.filter(id=sender_id, balance__gte=amount).update(
      balance=models.F('balance') - amount,
      version=models.F('version') + 1
  )
  ```
- **Guarantees:** Atomic in-database balance deduction without application-level race windows.

### 2.4 Unsafe Baseline (Lab Only)
- **Mechanism:** An intentionally vulnerable check-then-act pattern with artificial sleep delays to demonstrate the race condition and duplicate spending.
- **Safety Restriction:** Restricted strictly to temporary test accounts created inside the Race-Condition Laboratory. Production accounts are always protected.

---

## 3. Double-Entry Ledger Bookkeeping

In DataCore, an account balance is not the sole financial record. Every completed transaction generates matching immutable ledger records:

$$\sum \text{Debits} = \sum \text{Credits}$$

For every transfer of amount $X$ from Account $A$ to Account $B$:
1. **Debit Entry:** Subtracts $X$ from Account $A$; records `balance_after`.
2. **Credit Entry:** Adds $X$ to Account $B$; records `balance_after`.
3. Balance changes, ledger records, and transaction status transition to `COMPLETED` atomically inside a single PostgreSQL transaction. If any failure occurs, all mutations roll back.

---

## 4. Idempotency Protection

To protect against network retries, double-clicks, and duplicate submissions:
1. Clients provide a unique `Idempotency-Key` HTTP header (UUID v4).
2. The server computes a SHA-256 fingerprint hash of the request payload (`sender`, `receiver`, `amount`, `description`).
3. An `IdempotencyKey` row is inserted or queried with row locking.
4. **Outcomes:**
   - **First Request:** Processed normally; result payload cached with status `COMPLETED`.
   - **Identical Repeated Request:** Returns the cached response immediately with `200 OK` without re-executing the transfer.
   - **Mismatched Payload:** Reusing the same key with different data returns `400 Bad Request`.
   - **Concurrent Duplicate Submission:** In-flight duplicate detection returns `409 Conflict`.
