import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const body = await request.json();
  
  const result = await auth.api.signUpEmail({
    body,
    headers: await headers(),
  });

  // Return the result with proper status
  return Response.json(result, {
    status: result.user ? 200 : 400,
  });
}
