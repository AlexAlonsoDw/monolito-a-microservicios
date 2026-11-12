import type { UsersGateway } from "./users.port";
import { createPgUsersGateway } from "./users.gateway.pg";

// --- Gateway wiring --------------------------------------------------------
// Single place that decides which implementation the module uses. Today it
// always builds the PostgreSQL adapter; a later step makes this read
// USERS_BACKEND without touching the service or the routes.

let current: UsersGateway | undefined;

export function getUsersGateway(): UsersGateway {
  current ??= createPgUsersGateway();
  return current;
}

/** Replaces the active gateway. Used by tests and by application wiring. */
export function setUsersGateway(gateway: UsersGateway | undefined): void {
  current = gateway;
}
