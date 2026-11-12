import { AppError } from "@/lib/errors";
import type { UserDTO } from "./user.dto";
import type { UsersGateway } from "./users.port";

// --- Adapter: external HTTP service ----------------------------------------
// Implements the same port as the PostgreSQL adapter, but talks to a remote
// backend over HTTP/JSON. Nothing above this file knows which one is active.
// Two rules keep the module safe:
//   1. Never trust the remote payload: validate it before returning it.
//   2. Translate transport failures into the application's error model.

export type HttpUsersGatewayOptions = {
  /** Base URL of the remote users service, e.g. "http://localhost:8080". */
  baseUrl: string;
  /** Request timeout in milliseconds. Defaults to 5000. */
  timeoutMs?: number;
  /** Injectable for tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
};

export function createHttpUsersGateway(
  options: HttpUsersGatewayOptions,
): UsersGateway {
  const { baseUrl, timeoutMs = 5_000, fetchImpl = fetch } = options;
  const root = baseUrl.replace(/\/+$/, "");

  async function request(url: string, init: RequestInit): Promise<Response> {
    try {
      return await fetchImpl(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      // Connection refused, DNS failure or timeout: the dependency is down.
      throw new AppError("Users service is unavailable", 503);
    }
  }

  return {
    async getById(id) {
      const response = await request(
        `${root}/users/${encodeURIComponent(id)}`,
        { method: "GET" },
      );

      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw await toAppError(response);
      }

      return parseUserDTO(await response.json());
    },

    async create({ email, name }) {
      const response = await request(`${root}/users`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      if (!response.ok) {
        throw await toAppError(response);
      }

      return parseUserDTO(await response.json());
    },
  };
}

// Remote 4xx statuses are meaningful to our callers; anything else means the
// upstream dependency failed, which we report as 502 (bad gateway).
async function toAppError(response: Response): Promise<AppError> {
  const message = await readErrorMessage(response);

  if (response.status >= 400 && response.status < 500) {
    return new AppError(message, response.status);
  }
  return new AppError(message, 502);
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (isRecord(body) && typeof body.error === "string" && body.error) {
      return body.error;
    }
  } catch {
    // Body was not JSON: fall through to the generic message.
  }
  return `Users service responded with ${response.status}`;
}

function parseUserDTO(value: unknown): UserDTO {
  if (!isRecord(value)) {
    throw new AppError("Users service returned an invalid payload", 502);
  }

  const { id, email, name, createdAt } = value;
  if (
    typeof id !== "string" ||
    typeof email !== "string" ||
    typeof name !== "string" ||
    typeof createdAt !== "string"
  ) {
    throw new AppError("Users service returned an invalid payload", 502);
  }

  return { id, email, name, createdAt };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
