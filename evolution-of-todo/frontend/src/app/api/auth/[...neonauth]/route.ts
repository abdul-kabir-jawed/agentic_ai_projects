import { NextRequest, NextResponse } from 'next/server';

// Check if we're using local auth
const USE_LOCAL_AUTH = process.env.NEXT_PUBLIC_USE_LOCAL_AUTH === 'true';

// Handler functions that work whether authClient exists or not
export async function GET(req: NextRequest) {
  if (USE_LOCAL_AUTH) {
    return NextResponse.json({ error: 'Using local auth' }, { status: 404 });
  }

  try {
    const { authClient } = await import('@/lib/auth');
    if (!authClient || !authClient.handler) {
      return NextResponse.json({ error: 'Auth client not initialized' }, { status: 500 });
    }
    return authClient.handler.GET(req);
  } catch (error) {
    console.error('Auth handler error:', error);
    return NextResponse.json({ error: 'Auth error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (USE_LOCAL_AUTH) {
    return NextResponse.json({ error: 'Using local auth' }, { status: 404 });
  }

  try {
    const { authClient } = await import('@/lib/auth');
    if (!authClient || !authClient.handler) {
      return NextResponse.json({ error: 'Auth client not initialized' }, { status: 500 });
    }
    return authClient.handler.POST(req);
  } catch (error) {
    console.error('Auth handler error:', error);
    return NextResponse.json({ error: 'Auth error' }, { status: 500 });
  }
}
