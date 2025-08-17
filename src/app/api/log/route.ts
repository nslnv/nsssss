import { NextRequest, NextResponse } from 'next/server';

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// XSS sanitization function
function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/[^\w\s\-_.@#$%^&*()+={}[\]|\\:";'?/,.<>!~`]/g, '') // Allow safe characters
    .trim()
    .substring(0, 1000); // Limit length
}

// Rate limiting check
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // Extract client information
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Rate limiting check
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        { error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Invalid JSON payload:', error);
      return NextResponse.json(
        { error: 'Invalid JSON payload', code: 'INVALID_JSON' },
        { status: 400 }
      );
    }

    // Basic payload validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be an object', code: 'INVALID_PAYLOAD' },
        { status: 400 }
      );
    }

    // Sanitize all string fields in the payload
    const sanitizedPayload: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        sanitizedPayload[key] = sanitizeString(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitizedPayload[key] = value;
      } else if (value && typeof value === 'object') {
        // Handle nested objects (stringify and sanitize)
        try {
          sanitizedPayload[key] = sanitizeString(JSON.stringify(value));
        } catch {
          sanitizedPayload[key] = '[Object]';
        }
      } else {
        sanitizedPayload[key] = String(value || '').substring(0, 500);
      }
    }

    // Create log entry with context
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: clientIP,
      userAgent: sanitizeString(userAgent),
      payload: sanitizedPayload,
      type: sanitizedPayload.type || 'unknown',
      level: sanitizedPayload.level || 'info'
    };

    // Log to console with structured format
    const logMessage = `[FRONTEND_LOG] ${logEntry.timestamp} | IP: ${logEntry.ip} | Type: ${logEntry.type} | Level: ${logEntry.level}`;
    
    if (logEntry.level === 'error') {
      console.error(logMessage, logEntry.payload);
    } else if (logEntry.level === 'warn') {
      console.warn(logMessage, logEntry.payload);
    } else {
      console.log(logMessage, logEntry.payload);
    }

    // Always return success to not expose internal errors
    return NextResponse.json(
      { success: true, message: 'Log recorded' },
      { status: 200 }
    );

  } catch (error) {
    // Log server errors for debugging but don't expose to client
    console.error('POST /api/log error:', error);
    
    // Still return success to prevent exposing internal errors
    return NextResponse.json(
      { success: true, message: 'Log recorded' },
      { status: 200 }
    );
  }
}

// Clean up rate limit map periodically (in production, this would be handled differently)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000); // Clean up every minute