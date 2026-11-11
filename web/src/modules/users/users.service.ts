import { AppError } from "@/lib/errors";
import * as usersRepository from "./users.repository";

// --- Layer 2: Service ------------------------------------------------------
// The service holds the BUSINESS RULES (validation, uniqueness, etc.).
// It talks to the repository for data, but never writes SQL itself.
// Each rule here maps to a user story / requirement.

export async function getUser(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid user id", 400);
  }

  const user = await usersRepository.findById(id);
  if (!user) {
    throw new AppError(`User ${id} not found`, 404);
  }
  return user;
}

export async function createUser(input: { email?: string; name?: string }) {
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

  return usersRepository.create({ email, name });
}
