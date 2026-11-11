import { AppError } from "./errors";

// Translates any thrown error into a JSON HTTP response.
// Known AppErrors keep their status/message; anything else becomes a 500
// without leaking internal details to the client.
export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error("Unexpected error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
