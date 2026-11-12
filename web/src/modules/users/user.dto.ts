// --- Module contract: what a user looks like when it crosses the boundary ---
// This is deliberately NOT the database row. Snake_case columns and Date
// objects stay inside the module; consumers receive a stable DTO.

/** Output shape returned by the module (and by the HTTP API). */
export type UserDTO = {
  id: number;
  email: string;
  name: string;
  /** ISO 8601 timestamp, e.g. "2026-11-12T11:53:08.000Z" */
  createdAt: string;
};

/** Input shape accepted by the module to create a user. */
export type CreateUserDTO = {
  email?: string;
  name?: string;
};
