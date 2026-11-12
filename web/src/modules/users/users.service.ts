import { AppError } from "@/lib/errors";
import type { CreateUserDTO, UserDTO } from "./user.dto";
import { getUsersGateway } from "./users.gateway";

// --- Layer 2: Service ------------------------------------------------------
// The service holds the BUSINESS RULES that are independent of any backend:
// input shape and not-found mapping. It talks to the module's port, never to
// SQL and never to a concrete adapter.

export async function getUser(id: number): Promise<UserDTO> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid user id", 400);
  }

  const user = await getUsersGateway().getById(id);
  if (!user) {
    throw new AppError(`User ${id} not found`, 404);
  }
  return user;
}

export async function createUser(
  input: CreateUserDTO,
): Promise<UserDTO> {
  const email = input.email?.trim();
  const name = input.name?.trim();

  if (!email || !email.includes("@")) {
    throw new AppError("A valid email is required", 400);
  }
  if (!name) {
    throw new AppError("Name is required", 400);
  }

  // Uniqueness (409) is enforced by the active gateway: it is a property of
  // the storage, not of the transport.
  return getUsersGateway().create({ email, name });
}
