# Bank Transaction System

An advanced backend project simulating a real bank's money-movement engine, built with Node.js, Express, and MongoDB. Demonstrates double-entry accounting, ACID-safe transfers, JWT auth with RBAC, and event-driven email notifications via BullMQ + Redis.

## Key Architectural Decisions

- **Double-entry ledger**: every transfer writes a `DEBIT` and a `CREDIT` `LedgerEntry` (immutable, append-only). `Account.balance` is a cache, not the source of truth.
- **ACID transfers**: `transaction.service.js` wraps every money movement in a MongoDB session (`session.withTransaction`). If anything fails partway through, nothing is persisted — no half-completed transfers.
- **Optimistic locking**: each `Account` has a `version` field. Updates use `findOneAndUpdate({ _id, version })` — if another request modified the account first, the update is rejected with a 409 instead of silently overwriting it.
- **Idempotency**: clients can pass an `Idempotency-Key` header on transfer/deposit/withdraw. Retrying the same request (e.g. after a timeout) returns the original result instead of double-processing.
- **Event-driven emails**: `transaction.service.js` only emits events (`email.notify`) — it has zero knowledge of BullMQ, Redis, or Nodemailer. A separate listener enqueues a job; a separate worker process sends the actual email with automatic retries (3 attempts, exponential backoff). This means a slow or failing email provider can never slow down or break a money transfer.

## Project Structure

```
src/
├── config/        # DB, Redis, env
├── models/        # User, Account, Transaction, LedgerEntry, AuditLog
├── controllers/    # thin - parse req, call service, format response
├── services/       # all business logic lives here, fully unit-testable
├── routes/
├── middlewares/    # auth, RBAC, rate limiting, validation, error handling
├── validators/     # zod schemas
├── events/         # EventEmitter bridge to the job queue
├── jobs/           # BullMQ queue + worker
├── templates/      # email HTML templates
├── app.js          # Express app config
├── server.js       # API entrypoint
└── worker.js       # email worker entrypoint (separate process)
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Fill in `MONGO_URI`, JWT secrets, Redis host/port, and SMTP credentials.

**Gmail SMTP note**: you need a 16-character **App Password**, not your normal Gmail password. Enable 2FA on your Google account, then generate one at https://myaccount.google.com/apppasswords.

### 3. Run with Docker (recommended)
```bash
docker compose up --build
```
This starts 4 containers: `api`, `worker`, `mongo`, `redis`.

### 4. Or run locally
You'll need MongoDB (as a replica set — required for multi-document transactions) and Redis running locally.

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run worker:dev
```

## Testing

```bash
npm test
```

Tests run against an in-memory MongoDB **replica set** (via `mongodb-memory-server`), since `session.withTransaction()` requires one — a standalone `mongod` doesn't support multi-document transactions. Key tests:
- Successful transfer with correct ledger entries
- Insufficient funds → rejected, zero side effects
- Same-account transfer → rejected
- Repeated idempotency key → no double-processing
- Frozen destination account → rejected
- Concurrent transfers from the same account → no lost updates (debits always equal credits)

## API Overview

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

POST   /api/v1/accounts                    (create account for self)
GET    /api/v1/accounts/me
GET    /api/v1/accounts/:id
PATCH  /api/v1/accounts/:id/freeze         (admin only)
PATCH  /api/v1/accounts/:id/unfreeze       (admin only)

POST   /api/v1/transactions/transfer       (header: Idempotency-Key, optional)
POST   /api/v1/transactions/deposit
POST   /api/v1/transactions/withdraw
GET    /api/v1/transactions/account/:accountId
GET    /api/v1/transactions/:reference
```

All `/accounts` and `/transactions` routes require `Authorization: Bearer <accessToken>`.

## Example: making a transfer

```bash
curl -X POST http://localhost:5000/api/v1/transactions/transfer \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "fromAccountNumber": "ACC-1234567890",
    "toAccountNumber": "ACC-0987654321",
    "amount": 250
  }'
```

This will, in order:
1. Validate both accounts are `ACTIVE`
2. Debit the source, credit the destination, write two ledger entries — all in one MongoDB transaction
3. Emit `DEBIT` and `CREDIT` email events
4. Queue both as BullMQ jobs
5. The worker process sends the actual emails asynchronously, with retries on failure

## Possible Extensions

- Bull Board dashboard for inspecting failed email jobs
- Scheduled job to reconcile `Account.balance` against the sum of `LedgerEntry` records (catches drift/bugs)
- Transaction reversal endpoint (admin-only, creates an offsetting set of ledger entries rather than deleting anything)
- Swagger/OpenAPI docs
