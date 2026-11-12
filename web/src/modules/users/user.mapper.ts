import type { UserDTO } from "./user.dto";
import type { UserRow } from "./users.repository";

// --- Translation: database row -> module contract --------------------------
// The mapper is the ONLY place that knows how a row becomes a DTO. It also
// makes the wire format explicit: JSON has no Date type, so timestamps travel
// as ISO strings.

export function toUserDTO(row: UserRow): UserDTO {
  // node-postgres parses TIMESTAMPTZ into a Date, but be defensive: if the
  // driver ever hands back an ISO string, the contract must still hold.
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at
      : new Date(row.created_at);

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: createdAt.toISOString(),
  };
}
