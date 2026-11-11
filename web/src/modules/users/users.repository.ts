import { pool } from "@/lib/db";

// --- Layer 1: Repository ---------------------------------------------------
// The repository is the ONLY place that knows SQL. It maps rows <-> objects.
// It has no business rules: it just reads and writes the database.

export type User = {
  id: number;
  email: string;
  name: string;
  created_at: Date;
};

const USER_COLUMNS = "id, email, name, created_at";

export async function findById(id: number): Promise<User | null> {
  // $1 is a parameter placeholder. The value is sent SEPARATELY from the SQL,
  // so user input can never be interpreted as SQL (prevents SQL injection).
  const result = await pool.query<User>(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function findByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(
    `SELECT ${USER_COLUMNS} FROM users WHERE email = $1`,
    [email],
  );
  return result.rows[0] ?? null;
}

export async function create(input: {
  email: string;
  name: string;
}): Promise<User> {
  // RETURNING gives back the inserted row (including generated id/created_at).
  const result = await pool.query<User>(
    `INSERT INTO users (email, name)
     VALUES ($1, $2)
     RETURNING ${USER_COLUMNS}`,
    [input.email, input.name],
  );
  return result.rows[0];
}
