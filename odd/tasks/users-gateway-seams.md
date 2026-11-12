# Users Module Extraction Seams

## Objective
Make `modules/users` replaceable behind a stable contract, so the module can later be
served by an external backend (e.g. a Java microservice) without changing consumers.

## Problem
The `users` module is welded to PostgreSQL: the service imports the repository directly,
the HTTP response leaks the DB column `created_at`, and there is no test safety net.
A backend swap would require touching routes and every caller.

## Why
Prepare an incremental, reversible path toward a modular monolith -> microservices
migration (Strangler Fig), one module at a time.

## Scope
In scope:
- `web/src/modules/users/**`
- `web/tests/**`
- `web/vitest.config.ts`
- `web/package.json`

Out of scope:
- Writing the Java service
- Moving the `users` table or removing the `orders.user_id` FK
- Auth, observability, retries/circuit breakers, API versioning

## Constraints
- No behavior change beyond the response shape: `created_at` -> `createdAt`.
- `pg` stays the default backend.
- Every adapter must satisfy the same contract test suite.
- dependency-cruiser rules must keep passing.

## Tasks
- [ ] T1 — DTO + mapper: `UserDTO` with ISO `createdAt`, rename row type to `UserRow`,
      service returns DTO. Branch: `feature/users-dto`.
- [ ] T2 — Port + PG adapter: `UsersGateway` interface, `createPgUsersGateway`,
      factory defaulting to `pg`. Branch: `feature/users-gateway-port`.
- [ ] T3 — Contract tests: vitest setup, in-memory gateway, contract + service suites.
      Branch: `feature/users-contract-tests`.
- [ ] T4 — HTTP adapter + stub: `createHttpUsersGateway` with status -> AppError mapping,
      `node:http` stub test. Branch: `feature/users-http-adapter`.
- [ ] T5 — Backend switch: `USERS_BACKEND=pg|http` selection with validation.
      Branch: `feature/users-backend-switch`.

## Acceptance criteria
- Consumers import only `@/modules/users`.
- Response payload uses `createdAt` (ISO string); no `created_at` leaves the module.
- Both adapters pass the same contract suite.

## Checks
- `npm run lint`
- `npm run depcruise`
- `npx tsc --noEmit`
- `npm test`

## Progress
- Started: 2026-11-12
