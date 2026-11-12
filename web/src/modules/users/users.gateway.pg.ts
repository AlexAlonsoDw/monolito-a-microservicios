import { AppError } from "@/lib/errors";
import { toUserDTO } from "./user.mapper";
import type { UsersGateway } from "./users.port";
import * as usersRepository from "./users.repository";

// --- Adapter: PostgreSQL ---------------------------------------------------
// Implements the port on top of the existing repository. Uniqueness is a data
// rule, so it belongs here: each backend enforces its own storage constraints.
// Rows never leave this file: consumers only see UserDTO.

export function createPgUsersGateway(): UsersGateway {
  return {
    async getById(id) {
      // The contract id is an opaque string. In PostgreSQL it must be a
      // positive integer; anything else simply cannot exist there.
      const numericId = toNumericId(id);
      if (numericId === null) {
        return null;
      }

      const row = await usersRepository.findById(numericId);
      return row ? toUserDTO(row) : null;
    },

    async create({ email, name }) {
      const existing = await usersRepository.findByEmail(email);
      if (existing) {
        throw new AppError("Email already in use", 409);
      }

      const row = await usersRepository.create({ email, name });
      return toUserDTO(row);
    },
  };
}

function toNumericId(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
