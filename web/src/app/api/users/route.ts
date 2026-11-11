import { errorResponse } from "@/lib/http";
import { createUser } from "@/modules/users/users.service";

// --- Layer 3: HTTP route ---------------------------------------------------
// The route handler is a thin adapter: parse the request, call the service,
// shape the response. No business logic and no SQL live here.

// POST /api/users
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await createUser(body);
    return Response.json(user, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
