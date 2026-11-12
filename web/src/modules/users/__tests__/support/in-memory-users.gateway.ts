import { AppError } from "@/lib/errors";
import type { UserDTO } from "../../user.dto";
import type { UsersGateway } from "../../users.port";

// Test double: an in-memory implementation of the port. It is never shipped to
// production; it exists so the contract suite can run without a database.
export function createInMemoryUsersGateway(): UsersGateway {
  const users = new Map<number, UserDTO>();
  let nextId = 1;

  return {
    async getById(id) {
      return users.get(id) ?? null;
    },

    async create({ email, name }) {
      const taken = [...users.values()].some((user) => user.email === email);
      if (taken) {
        throw new AppError("Email already in use", 409);
      }

      const user: UserDTO = {
        id: nextId++,
        email,
        name,
        createdAt: new Date().toISOString(),
      };
      users.set(user.id, user);
      return user;
    },
  };
}
