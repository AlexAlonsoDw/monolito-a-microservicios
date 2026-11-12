import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createHttpUsersGateway } from "../users.gateway.http";
import { runUsersGatewayContract } from "./support/contract";

// --- Stub backend ----------------------------------------------------------
// A minimal in-process HTTP server that behaves like the remote users service.
// It is NOT a mock: it really speaks HTTP, so the adapter is exercised end to
// end (serialization, status codes, headers) without needing Java.

type StubUser = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
};

function createStubBackend() {
  const users = new Map<number, StubUser>();
  let nextId = 1;

  const server: Server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    const send = (status: number, body: unknown) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };

    if (req.method === "GET" && url.pathname.startsWith("/users/")) {
      const id = Number(url.pathname.split("/").at(-1));
      const user = users.get(id);
      if (!user) {
        send(404, { error: "User not found" });
        return;
      }
      send(200, user);
      return;
    }

    if (req.method === "POST" && url.pathname === "/users") {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
      }

      const parsed: unknown = JSON.parse(
        Buffer.concat(chunks).toString("utf8") || "{}",
      );
      const payload = parsed as { email?: unknown; name?: unknown };
      const email = typeof payload.email === "string" ? payload.email : "";
      const name = typeof payload.name === "string" ? payload.name : "";

      const taken = [...users.values()].some((user) => user.email === email);
      if (taken) {
        send(409, { error: "Email already in use" });
        return;
      }

      const user: StubUser = {
        id: nextId++,
        email,
        name,
        createdAt: new Date().toISOString(),
      };
      users.set(user.id, user);
      send(201, user);
      return;
    }

    send(404, { error: "Not found" });
  });

  return {
    server,
    reset() {
      users.clear();
      nextId = 1;
    },
  };
}

let stub: ReturnType<typeof createStubBackend>;
let baseUrl: string;

beforeAll(async () => {
  stub = createStubBackend();
  await new Promise<void>((resolve) => {
    stub.server.listen(0, "127.0.0.1", resolve);
  });
  const address = stub.server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    stub.server.close((error) => (error ? reject(error) : resolve()));
  });
});

runUsersGatewayContract({
  name: "http",
  createGateway: () => {
    stub.reset();
    return createHttpUsersGateway({ baseUrl });
  },
});

describe("http gateway failure translation", () => {
  it("returns null when the remote answers 404", async () => {
    stub.reset();
    const gateway = createHttpUsersGateway({ baseUrl });

    await expect(gateway.getById(123)).resolves.toBeNull();
  });

  it("maps a connection failure to 503", async () => {
    // Port 1 is never listening during the test run.
    const gateway = createHttpUsersGateway({
      baseUrl: "http://127.0.0.1:1",
      timeoutMs: 500,
    });

    await expect(gateway.getById(1)).rejects.toMatchObject({ status: 503 });
  });

  it("maps an invalid remote payload to 502", async () => {
    const badBackend = createServer((_req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ id: "not-a-number" }));
    });

    await new Promise<void>((resolve) => {
      badBackend.listen(0, "127.0.0.1", resolve);
    });
    const address = badBackend.address() as AddressInfo;

    try {
      const gateway = createHttpUsersGateway({
        baseUrl: `http://127.0.0.1:${address.port}`,
      });

      await expect(gateway.getById(1)).rejects.toMatchObject({ status: 502 });
    } finally {
      await new Promise<void>((resolve, reject) => {
        badBackend.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
