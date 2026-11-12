import type { UserDTO } from "./user.dto";

// --- Port: the module's data capability ------------------------------------
// The service depends on this interface, never on a concrete backend. Every
// implementation (PostgreSQL today, an external HTTP service tomorrow) must
// satisfy the same contract. This is what makes the module replaceable.

export interface UsersGateway {
  /** Returns the user, or null when it does not exist. */
  getById(id: string): Promise<UserDTO | null>;

  /**
   * Persists a new user and returns it.
   * Must throw an AppError with status 409 when the email is already taken.
   */
  create(input: { email: string; name: string }): Promise<UserDTO>;
}
