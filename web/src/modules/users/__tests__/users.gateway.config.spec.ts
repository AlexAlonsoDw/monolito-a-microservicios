import { describe, expect, it } from "vitest";
import {
  createConfiguredUsersGateway,
  resolveUsersBackend,
} from "../users.gateway";

describe("users gateway configuration", () => {
  it("defaults to pg when USERS_BACKEND is unset or blank", () => {
    expect(resolveUsersBackend(undefined)).toBe("pg");
    expect(resolveUsersBackend("")).toBe("pg");
    expect(resolveUsersBackend("   ")).toBe("pg");
  });

  it("accepts pg and http case-insensitively", () => {
    expect(resolveUsersBackend("PG")).toBe("pg");
    expect(resolveUsersBackend(" HTTP ")).toBe("http");
  });

  it("rejects an unsupported backend", () => {
    expect(() => resolveUsersBackend("mongo")).toThrow(
      /Unsupported USERS_BACKEND/,
    );
  });

  it("builds the pg adapter by default", () => {
    const gateway = createConfiguredUsersGateway({});

    expect(typeof gateway.getById).toBe("function");
    expect(typeof gateway.create).toBe("function");
  });

  it("requires USERS_SERVICE_URL when USERS_BACKEND is http", () => {
    expect(() =>
      createConfiguredUsersGateway({ USERS_BACKEND: "http" }),
    ).toThrow(/USERS_SERVICE_URL/);
  });

  it("builds the http adapter when configured", async () => {
    const gateway = createConfiguredUsersGateway({
      USERS_BACKEND: "http",
      // Port 1 is never listening: a 503 proves the HTTP adapter is in use.
      USERS_SERVICE_URL: "http://127.0.0.1:1",
    });

    await expect(gateway.getById("1")).rejects.toMatchObject({ status: 503 });
  });
});
