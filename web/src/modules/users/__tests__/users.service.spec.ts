import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setUsersGateway } from "../users.gateway";
import { createUser, getUser } from "../users.service";
import { createInMemoryUsersGateway } from "./support/in-memory-users.gateway";

describe("users service", () => {
  beforeEach(() => {
    setUsersGateway(createInMemoryUsersGateway());
  });

  afterEach(() => {
    setUsersGateway(undefined);
  });

  it("rejects a blank id with 400", async () => {
    await expect(getUser("   ")).rejects.toMatchObject({ status: 400 });
  });

  it("rejects an id with illegal characters with 400", async () => {
    await expect(getUser("abc def")).rejects.toMatchObject({ status: 400 });
  });

  it("returns 404 when the user does not exist", async () => {
    await expect(getUser("123")).rejects.toMatchObject({ status: 404 });
  });

  it("trims the id before looking it up", async () => {
    const created = await createUser({
      email: "trim@example.com",
      name: "Trim",
    });

    await expect(getUser(`  ${created.id}  `)).resolves.toEqual(created);
  });

  it("trims input and returns the created DTO", async () => {
    const user = await createUser({
      email: "  ana@example.com  ",
      name: "  Ana  ",
    });

    expect(user.email).toBe("ana@example.com");
    expect(user.name).toBe("Ana");
    expect(user.createdAt).toBe(new Date(user.createdAt).toISOString());
  });

  it("rejects an invalid email with 400", async () => {
    await expect(
      createUser({ email: "not-an-email", name: "Ana" }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("rejects an empty name with 400", async () => {
    await expect(
      createUser({ email: "ana@example.com", name: "   " }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("maps a duplicate email to 409", async () => {
    await createUser({ email: "dup@example.com", name: "First" });

    await expect(
      createUser({ email: "dup@example.com", name: "Second" }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
