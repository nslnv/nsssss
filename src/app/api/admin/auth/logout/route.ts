import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

// Helper function to log audit events
async function logAudit(level: string, message: string, context?: any) {
  try {
    await db.insert(auditLogs).values({
      level,
      message,
      context: context ? JSON.stringify(context) : null,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session info for audit logging (before clearing)
    let username = 'unknown';
    let hadActiveSession = false;
    
    const sessionCookie = request.cookies.get('admin_session');
    if (sessionCookie?.value) {
      try {
        const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);
        username = payload.username as string || 'unknown';
        hadActiveSession = true;
      } catch (error) {
        // Invalid/expired token - still proceed with logout
        console.log('Invalid session token during logout:', error);
      }
    }

    // Get client IP for audit logging
    const ip = request.ip ?? '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create response and clear the cookie
    const response = NextResponse.json({
      ok: true,
      message: "Logged out successfully"
    }, { status: 200 });

    // Clear the admin session cookie
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0) // Past date to clear cookie
    });

    // Log the logout event
    await logAudit('info', 'Admin logout successful', {
      username,
      ip,
      userAgent,
      hadActiveSession,
      timestamp: new Date().toISOString()
    });

    return response;

  } catch (error) {
    console.error('POST logout error:', error);
    
    // Even on system error, still clear cookie and return success for security
    const response = NextResponse.json({
      ok: true,
      message: "Logged out successfully"
    }, { status: 200 });

    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0)
    });

    // Log the system error
    await logAudit('error', 'Logout system error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return response;
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json({ 
    ok: false,
    code: "METHOD_NOT_ALLOWED",
    error: "Method not allowed" 
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ 
    ok: false,
    code: "METHOD_NOT_ALLOWED", 
    error: "Method not allowed" 
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ 
    ok: false,
    code: "METHOD_NOT_ALLOWED",
    error: "Method not allowed" 
  }, { status: 405 });
}