import type { UsersGateway } from "./users.port";
import { createHttpUsersGateway } from "./users.gateway.http";
import { createPgUsersGateway } from "./users.gateway.pg";

// --- Gateway wiring --------------------------------------------------------
// Single place that decides which implementation the module uses:
//   USERS_BACKEND=pg    (default) -> PostgreSQL adapter
//   USERS_BACKEND=http            -> external HTTP service (USERS_SERVICE_URL)
// The service and the routes never learn which one is active.

export type UsersBackend = "pg" | "http";

/** Reads USERS_BACKEND. Unset or empty means "pg", for backwards compatibility. */
export function resolveUsersBackend(value: string | undefined): UsersBackend {
  const normalized = value?.trim().toLowerCase();

  if (!normalized || normalized === "pg") {
    return "pg";
  }
  if (normalized === "http") {
    return "http";
  }

  throw new Error(
    `Unsupported USERS_BACKEND "${value}". Expected "pg" or "http".`,
  );
}

/** Builds the adapter selected by the given environment. */
export function createConfiguredUsersGateway(
  env: Record<string, string | undefined> = process.env,
): UsersGateway {
  const backend = resolveUsersBackend(env.USERS_BACKEND);

  if (backend === "http") {
    const baseUrl = env.USERS_SERVICE_URL?.trim();
    if (!baseUrl) {
      throw new Error(
        'USERS_BACKEND is "http" but USERS_SERVICE_URL is not set.',
      );
    }
    return createHttpUsersGateway({ baseUrl });
  }

  return createPgUsersGateway();
}

let current: UsersGateway | undefined;

export function getUsersGateway(): UsersGateway {
  current ??= createConfiguredUsersGateway();
  return current;
}

/** Replaces the active gateway. Used by tests and by application wiring. */
export function setUsersGateway(gateway: UsersGateway | undefined): void {
  current = gateway;
}
