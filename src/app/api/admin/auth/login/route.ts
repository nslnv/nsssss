import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminUsers, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

// Rate limiting storage (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting helper
function checkRateLimit(ip: string): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    const newRecord = { count: 1, resetTime: now + windowMs };
    rateLimitMap.set(ip, newRecord);
    return { success: true, remaining: maxAttempts - 1, resetTime: newRecord.resetTime };
  }

  if (record.count >= maxAttempts) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { success: true, remaining: maxAttempts - record.count, resetTime: record.resetTime };
}

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
    const ip = request.ip ?? '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Rate limiting check
    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.success) {
      await logAudit('warn', 'Login rate limit exceeded', { ip, userAgent });
      
      return NextResponse.json({
        ok: false,
        code: 'RATE_LIMIT_EXCEEDED',
        error: 'Too many login attempts. Please try again later.'
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        }
      });
    }

    const body = await request.json();
    const { username, password } = body;

    // Validate required fields
    if (!username || typeof username !== 'string') {
      await logAudit('warn', 'Login attempt with missing username', { ip, userAgent });
      return NextResponse.json({
        ok: false,
        code: 'MISSING_USERNAME',
        error: 'Username is required'
      }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      await logAudit('warn', 'Login attempt with missing password', { 
        username: username.trim(), 
        ip, 
        userAgent 
      });
      return NextResponse.json({
        ok: false,
        code: 'MISSING_PASSWORD',
        error: 'Password is required'
      }, { status: 400 });
    }

    // Sanitize input
    const sanitizedUsername = username.trim().toLowerCase();

    // Find admin user by username
    const adminUser = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.username, sanitizedUsername))
      .limit(1);

    if (adminUser.length === 0) {
      await logAudit('warn', 'Login attempt with invalid username', { 
        username: sanitizedUsername, 
        ip,
        userAgent
      });
      return NextResponse.json({
        ok: false,
        code: 'INVALID_CREDENTIALS',
        error: 'Invalid username or password'
      }, { status: 401 });
    }

    const user = adminUser[0];

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      await logAudit('warn', 'Login attempt with invalid password', { 
        username: sanitizedUsername,
        userId: user.id,
        ip,
        userAgent
      });
      return NextResponse.json({
        ok: false,
        code: 'INVALID_CREDENTIALS',
        error: 'Invalid username or password'
      }, { status: 401 });
    }

    // Generate JWT token with 7 days expiration
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (7 * 24 * 60 * 60); // 7 days

    const token = await new SignJWT({
      sub: user.id.toString(),
      username: user.username,
      role: user.role,
      iat: now,
      exp: exp
    })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(JWT_SECRET);

    // Create response with cookie
    const response = NextResponse.json({
      ok: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }, { status: 200 });

    // Set secure HTTP-only cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });

    // Log successful login
    await logAudit('info', 'Successful admin login', { 
      username: user.username,
      userId: user.id,
      role: user.role,
      ip,
      userAgent
    });

    return response;

  } catch (error) {
    console.error('POST /api/admin/auth/login error:', error);
    
    // Log system error
    await logAudit('error', 'System error during login attempt', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.ip,
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Clean up rate limit map periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000); // Clean up every minute