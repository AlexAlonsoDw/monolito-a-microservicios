import { errorResponse } from "@/lib/http";
import { getUser } from "@/modules/users";

// GET /api/users/:id
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // In the App Router (Next 15+), `params` is a Promise: you must await it.
    const { id } = await params;
    const user = await getUser(id);
    return Response.json(user);
  } catch (error) {
    return errorResponse(error);
  }
}
