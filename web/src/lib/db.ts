import { Pool } from "pg";

// In development Next.js reloads modules on every file change. Without this
// guard, each reload would create a brand-new connection pool and eventually
// exhaust PostgreSQL's max connections. Reusing a single global pool keeps the
// same connections alive across reloads.
const globalForDb = globalThis as unknown as { pool?: Pool };

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Fail fast instead of hanging forever if the database is unreachable.
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}
