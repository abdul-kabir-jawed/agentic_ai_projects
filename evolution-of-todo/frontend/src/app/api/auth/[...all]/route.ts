import { NextRequest, NextResponse } from "next/server";

/**
 * Auth API Proxy
 *
 * This route proxies all authentication requests to the backend API:
 * - POST /api/auth/sign-up (register)
 * - POST /api/auth/sign-in (login)
 * - POST /api/auth/sign-out (logout)
 * - GET /api/auth/session (get current session)
 * - And other auth operations
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function handleRequest(request: NextRequest, method: string) {
  try {
    // Get the path from the request URL
    const pathname = new URL(request.url).pathname;
    const authPath = pathname.replace('/api/auth', '');

    const backendUrl = `${BACKEND_URL}/auth${authPath}`;
    console.log(`[AUTH PROXY] ${method} ${pathname} -> ${backendUrl}`);

    const body = method !== 'GET' && method !== 'HEAD' ? await request.text() : undefined;

    const response = await fetch(backendUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body,
    });

    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error(`[AUTH PROXY] Error handling ${method} request:`, error);
    return NextResponse.json(
      { error: "Auth service unavailable", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 503 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  // Ensure the request has a valid JSON body for Better Auth
  // Some endpoints like sign-out may be called with an empty body which causes JSON parse errors
  const contentType = request.headers.get("content-type");
  const contentLength = request.headers.get("content-length");

  // If no body or empty body, create a request with empty JSON object
  const needsEmptyJsonBody =
    !contentType ||
    !contentType.includes("application/json") ||
    contentLength === "0" ||
    contentLength === null;

  if (needsEmptyJsonBody) {
    // Clone the request body to check if it's empty
    const clonedRequest = request.clone();
    let bodyText = "";
    try {
      bodyText = await clonedRequest.text();
    } catch {
      // If we can't read the body, assume it's empty
    }

    // If body is empty or not valid JSON, create new request with empty JSON body
    if (!bodyText || bodyText.trim() === "") {
      const url = new URL(request.url);
      const newHeaders = new Headers(request.headers);
      newHeaders.set("content-type", "application/json");

      const newRequest = new NextRequest(url, {
        method: "POST",
        headers: newHeaders,
        body: JSON.stringify({}),
      });

      // Copy cookies to the new request
      const cookies = request.cookies.getAll();
      cookies.forEach((cookie) => {
        newRequest.cookies.set(cookie.name, cookie.value);
      });

      return handleRequest(newRequest, "POST");
    }
  }

  return handleRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, "PUT");
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, "DELETE");
}
