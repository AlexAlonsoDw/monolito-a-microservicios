import { pool } from "@/lib/db";

// Note: with Cache Components (Next 16), a database query inside the handler
// automatically opts the route out of prerendering, so it runs at request
// time. No `dynamic`/`runtime` exports are needed (and they are disallowed).
export async function GET() {
  try {
    const result = await pool.query<{ now: Date; database: string }>(
      "SELECT NOW() AS now, current_database() AS database",
    );

    return Response.json({ status: "ok", ...result.rows[0] });
  } catch (error) {
    console.error("Database health check failed:", error);
    return Response.json(
      { status: "error", message: "Database connection failed" },
      { status: 500 },
    );
  }
}
