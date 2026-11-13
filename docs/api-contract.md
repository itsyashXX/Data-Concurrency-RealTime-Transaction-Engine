# DataCore REST API Specification

Base URL: `/api/`

---

## 1. Authentication Endpoints (`/api/auth/`)

### 1.1 Register Customer Account
- **Endpoint:** `POST /api/auth/register/`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "full_name": "Alice Johnson",
    "email": "alice@datacore.io",
    "password": "SecurePassword123!",
    "confirm_password": "SecurePassword123!"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "message": "User registered successfully.",
    "user": {
      "id": "c76a1a4f-...",
      "email": "alice@datacore.io",
      "full_name": "Alice Johnson",
      "role": "USER",
      "date_joined": "2026-11-13T10:00:00Z"
    },
    "access": "<JWT Access Token>",
    "refresh": "<JWT Refresh Token>"
  }
  ```

### 1.2 Login
- **Endpoint:** `POST /api/auth/login/`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "email": "alice@datacore.io",
    "password": "SecurePassword123!"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "user": { ... },
    "access": "<JWT Access Token>",
    "refresh": "<JWT Refresh Token>"
  }
  ```

---

## 2. Customer Financial Endpoints

### 2.1 List Accounts
- **Endpoint:** `GET /api/accounts/`
- **Auth:** `Bearer <token>`
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": "45d1f860-...",
      "account_number": "DC-7489-1024",
      "user_email": "alice@datacore.io",
      "balance": "10000.00",
      "currency": "INR",
      "version": 0,
      "is_active": true
    }
  ]
  ```

### 2.2 Execute Fund Transfer
- **Endpoint:** `POST /api/transactions/`
- **Auth:** `Bearer <token>`
- **Headers:** `Idempotency-Key: <UUID>`
- **Request Body:**
  ```json
  {
    "receiver_identifier": "bob@datacore.io",
    "amount": "250.00",
    "description": "Reimbursement",
    "concurrency_strategy": "PESSIMISTIC"
  }
  ```
- **Response (`201 Created` / `200 OK` cached):**
  ```json
  {
    "id": "e4f8d9b1-...",
    "sender_account": "DC-7489-1024",
    "receiver_account": "DC-3912-8821",
    "amount": "250.00",
    "currency": "INR",
    "status": "COMPLETED",
    "concurrency_strategy": "PESSIMISTIC",
    "sender_balance_after": "9750.00",
    "latency_ms": 14.52,
    "completed_at": "2026-11-13T10:05:00Z"
  }
  ```

---

## 3. Administrator Endpoints (`/api/admin/`)
*All admin endpoints require an authenticated user with `role: "ADMIN"` or `is_staff: true`.*

### 3.1 Platform Overview
- **Endpoint:** `GET /api/admin/overview/`
- **Response (`200 OK`):**
  ```json
  {
    "metrics": {
      "total_users": 15,
      "active_users": 4,
      "total_transactions": 84,
      "completed_transactions": 82,
      "failed_transactions": 2,
      "duplicate_requests_handled": 12,
      "throughput_last_hour": 18,
      "average_latency_ms": 18.2
    },
    "financial_consistency": {
      "total_system_balance": "150000.00",
      "total_ledger_debits": "45250.00",
      "total_ledger_credits": "195250.00",
      "ledger_invariants_balanced": true
    }
  }
  ```

### 3.2 Race-Condition Experiment
- **Endpoint:** `POST /api/admin/experiments/`
- **Request Body:**
  ```json
  {
    "strategy": "PESSIMISTIC",
    "initial_balance": "1000.00",
    "withdrawals": ["700.00", "500.00"]
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "id": "3b2c1a...",
    "strategy": "PESSIMISTIC",
    "initial_balance": "1000.00",
    "final_balance": "300.00",
    "invariants_preserved": true,
    "successful_count": 1,
    "failed_count": 1,
    "logs": [ ... ]
  }
  ```
