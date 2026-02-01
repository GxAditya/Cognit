import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json(null, { status: 401 });
  }

  // Return the session in the expected format
  // Better Auth returns { user, session } where session contains token
  return Response.json({
    user: session.user,
    session: session.session,
    token: session.session?.token || null,
  });
}
