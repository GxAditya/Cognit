import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const body = await request.json();
  const requestHeaders = await headers();
  
  try {
    const result = await auth.api.signInEmail({
      body,
      headers: requestHeaders,
      asResponse: true, // Returns a Response object directly with cookies
    });

    // result is now a Response object when asResponse: true
    // Extract the body and forward the cookies
    const responseData = await result.json();
    
    // Get the set-cookie headers from the auth response
    const setCookieHeader = result.headers.get('set-cookie');
    
    // Create response headers
    const responseHeaders = new Headers();
    
    // Forward the set-cookie headers to the client
    if (setCookieHeader) {
      responseHeaders.set('set-cookie', setCookieHeader);
    }

    // Return the result with proper status
    return Response.json(
      { user: responseData?.user },
      {
        status: responseData?.user ? 200 : 400,
        headers: responseHeaders,
      }
    );
  } catch (error) {
    console.error('Sign in error:', error);
    return Response.json(
      { message: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
}
