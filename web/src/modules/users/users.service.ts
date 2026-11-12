import { AppError } from "@/lib/errors";
import type { CreateUserDTO, UserDTO } from "./user.dto";
import { toUserDTO } from "./user.mapper";
import * as usersRepository from "./users.repository";

// --- Layer 2: Service ------------------------------------------------------
// The service holds the BUSINESS RULES (validation, uniqueness, etc.).
// It talks to the repository for data, but never writes SQL itself.
// It returns DTOs, never database rows: the wire contract stops here.

export async function getUser(id: number): Promise<UserDTO> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid user id", 400);
  }

  const row = await usersRepository.findById(id);
  if (!row) {
    throw new AppError(`User ${id} not found`, 404);
  }
  return toUserDTO(row);
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

  // Uniqueness is a business rule: check before inserting for a clean 409.
  // (The DB UNIQUE constraint is the final safety net.)
  const existing = await usersRepository.findByEmail(email);
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const created = await usersRepository.create({ email, name });
  return toUserDTO(created);
}
