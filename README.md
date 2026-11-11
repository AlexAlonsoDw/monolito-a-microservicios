# Monolith → Microservices (practice)

A hands-on learning project: build a small online store as a **Next.js monolith** first,
then progressively **extract one service (Orders) into Java + Spring Boot**.

> This is a practice/learning project. It is **not** production software.

## Stack

- Next.js 16 (App Router) + TypeScript
- PostgreSQL 17
- `pg` — raw SQL (no ORM)

## What's implemented

- [x] PostgreSQL schema: `users`, `products`, `orders`, `order_items`
- [x] DB connection (`pg` Pool) + `/api/health`
- [x] Users module (3 layers: route → service → repository)
- [ ] Catalog module
- [ ] Orders module (inside the monolith)
- [ ] Extract Orders to Java / Spring Boot

## Run locally

Requirements: Node 20+ and PostgreSQL 17.

```bash
# 1. install dependencies
cd web
npm install

# 2. create the database + schema + sample data
psql -U postgres -c "CREATE DATABASE tienda;"
psql -U postgres -d tienda -f db/schema.sql
psql -U postgres -d tienda -f db/seed.sql

# 3. configure the connection string
cp .env.example .env.local
#   edit DATABASE_URL if your local setup differs

# 4. run the dev server
npm run dev
```

### Endpoints

| Method | Path            | Description        |
| ------ | --------------- | ------------------ |
| GET    | `/api/health`   | DB health check    |
| POST   | `/api/users`    | Create a user      |
| GET    | `/api/users/:id`| Get a user by id   |

## Architecture

Each module is split into three layers:

```
Route handler (HTTP)  →  Service (business rules)  →  Repository (SQL)  →  PostgreSQL
```

This separation is what makes it possible to later move a module (e.g. Orders)
into its own service without rewriting the HTTP or DB concerns.

## Security notes

- This project uses **local development credentials only** (see `.env.example`).
  `.env.local` holds the real values and is **git-ignored** — never commit it.
- All SQL uses **parameterized queries** (`$1`, `$2`), which prevents SQL injection.
- Publishing this repository exposes **source code only** — nothing runs publicly.
  If you deploy it, provide real secrets through environment variables and never commit them.
