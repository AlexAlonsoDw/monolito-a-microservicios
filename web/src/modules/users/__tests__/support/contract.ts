import { beforeEach, describe, expect, it } from "vitest";
import type { UsersGateway } from "../../users.port";

export type GatewayHarness = {
  name: string;
  createGateway: () => UsersGateway | Promise<UsersGateway>;
};

// Behaviour every UsersGateway implementation must honour, regardless of the
// storage behind it (PostgreSQL today, an external HTTP service tomorrow).
// Adding a new adapter is one call to this function.
export function runUsersGatewayContract(harness: GatewayHarness): void {
  describe(`UsersGateway contract > ${harness.name}`, () => {
    let gateway: UsersGateway;

    beforeEach(async () => {
      gateway = await harness.createGateway();
    });

    it("creates a user and returns a DTO with an ISO createdAt", async () => {
      const user = await gateway.create({
        email: "ana@example.com",
        name: "Ana",
      });

      expect(typeof user.id).toBe("string");
      expect(user.id.length).toBeGreaterThan(0);
      expect(user.email).toBe("ana@example.com");
      expect(user.name).toBe("Ana");
      expect(user.createdAt).toBe(new Date(user.createdAt).toISOString());
    });

    it("returns the created user from getById", async () => {
      const created = await gateway.create({
        email: "carlos@example.com",
        name: "Carlos",
      });

      await expect(gateway.getById(created.id)).resolves.toEqual(created);
    });

    it("returns null for an unknown id", async () => {
      await expect(gateway.getById("9999999")).resolves.toBeNull();
    });

    it("rejects a duplicate email with status 409", async () => {
      await gateway.create({ email: "dup@example.com", name: "First" });

      await expect(
        gateway.create({ email: "dup@example.com", name: "Second" }),
      ).rejects.toMatchObject({ status: 409 });
    });

    it("never exposes the database column name", async () => {
      const user = await gateway.create({
        email: "kim@example.com",
        name: "Kim",
      });

      expect(user).not.toHaveProperty("created_at");
    });
  });
}
