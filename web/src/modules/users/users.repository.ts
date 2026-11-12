import { pool } from "@/lib/db";

// --- Layer 1: Repository ---------------------------------------------------
// The repository is the ONLY place that knows SQL. It maps rows <-> objects.
// It has no business rules: it just reads and writes the database.

// The shape of a row as it comes out of PostgreSQL. This type is internal to
// the module: it must never be returned to consumers as-is (see user.dto.ts).
export type UserRow = {
  // node-postgres returns BIGINT (int8) as a string, because JavaScript
  // numbers cannot safely represent 64-bit integers. Typing it as string
  // matches what the driver actually gives us.
  id: string;
  email: string;
  name: string;
  created_at: Date;
};

const USER_COLUMNS = "id, email, name, created_at";

export async function findById(id: number): Promise<UserRow | null> {
  // $1 is a parameter placeholder. The value is sent SEPARATELY from the SQL,
  // so user input can never be interpreted as SQL (prevents SQL injection).
  const result = await pool.query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users WHERE email = $1`,
    [email],
  );
  return result.rows[0] ?? null;
}

export async function create(input: {
  email: string;
  name: string;
}): Promise<UserRow> {
  // RETURNING gives back the inserted row (including generated id/created_at).
  const result = await pool.query<UserRow>(
    `INSERT INTO users (email, name)
     VALUES ($1, $2)
     RETURNING ${USER_COLUMNS}`,
    [input.email, input.name],
  );
  return result.rows[0];
}
