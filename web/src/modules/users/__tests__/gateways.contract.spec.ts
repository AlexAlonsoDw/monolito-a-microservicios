import { describe } from "vitest";
import { createPgUsersGateway } from "../users.gateway.pg";
import { runUsersGatewayContract } from "./support/contract";
import { createInMemoryUsersGateway } from "./support/in-memory-users.gateway";

runUsersGatewayContract({
  name: "in-memory",
  createGateway: createInMemoryUsersGateway,
});

// The PostgreSQL adapter needs a live database. Set DATABASE_URL to run it;
// without it the suite is skipped instead of failing in a clean environment.
describe.skipIf(!process.env.DATABASE_URL)("postgres adapter", () => {
  runUsersGatewayContract({
    name: "postgres",
    createGateway: createPgUsersGateway,
  });
});
