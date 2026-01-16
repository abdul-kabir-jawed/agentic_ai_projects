import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * API Proxy to FastAPI backend
 *
 * This proxy:
 * 1. Validates the Better Auth session
 * 2. Forwards requests to FastAPI with user ID in header
 * 3. Returns the response from FastAPI
 */
async function proxyRequest(request: NextRequest, method: string) {
  try {
    // Get the path from the URL (everything after /api/proxy/)
    const url = new URL(request.url);
    const pathParts = url.pathname.replace('/api/proxy/', '');
    const targetUrl = `${BACKEND_URL}/api/v1/${pathParts}${url.search}`;

    console.log(`[PROXY] ${method} ${targetUrl}`);

    // Validate session and get user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      console.log('[PROXY] No valid session found');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log(`[PROXY] User authenticated: ${session.user.email}`);

    // Prepare headers for FastAPI
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      // Pass user info to FastAPI
      'X-User-ID': session.user.id,
      'X-User-Email': session.user.email,
    };

    // Prepare request options
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    // Forward request to FastAPI
    const response = await fetch(targetUrl, fetchOptions);

    // Get response data
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    let data;

    console.log(`[PROXY] Response status: ${response.status}`);

    // Handle empty responses (e.g., 204 No Content for DELETE)
    if (response.status === 204 || contentLength === '0') {
      return new NextResponse(null, { status: response.status });
    }

    // Try to parse JSON if content-type indicates JSON
    if (contentType?.includes('application/json')) {
      const text = await response.text();
      // Only parse if there's actual content
      if (text && text.trim()) {
        try {
          data = JSON.parse(text);
          return NextResponse.json(data, { status: response.status });
        } catch {
          // If JSON parsing fails, return as text
          return new NextResponse(text, { status: response.status });
        }
      }
      // Empty JSON response
      return NextResponse.json({}, { status: response.status });
    }

    // Return text response
    data = await response.text();
    return new NextResponse(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY] Error:', error);
    return NextResponse.json(
      { error: 'Proxy error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE');
}
