import { NextRequest, NextResponse } from 'next/server';
import { errorLogRateLimiter } from '@/lib/ratelimit';

interface ErrorData {
  message: string;
  source?: string;
  line?: number;
  column?: number;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  stack?: string;
}

interface SanitizedErrorData {
  message: string;
  source?: string;
  line?: number;
  column?: number;
  userAgent?: string;
  url?: string;
  timestamp: string;
  stack?: string;
}

// Sanitize error data to remove any potential personal information
function sanitizeErrorData(data: ErrorData): SanitizedErrorData {
  const sanitized: SanitizedErrorData = {
    message: sanitizeString(data.message || 'Unknown error'),
    timestamp: data.timestamp || new Date().toISOString(),
  };

  // Only include safe fields
  if (data.source && typeof data.source === 'string') {
    sanitized.source = sanitizeUrl(data.source);
  }

  if (typeof data.line === 'number' && data.line > 0) {
    sanitized.line = data.line;
  }

  if (typeof data.column === 'number' && data.column > 0) {
    sanitized.column = data.column;
  }

  if (data.userAgent && typeof data.userAgent === 'string') {
    sanitized.userAgent = sanitizeUserAgent(data.userAgent);
  }

  if (data.url && typeof data.url === 'string') {
    sanitized.url = sanitizeUrl(data.url);
  }

  if (data.stack && typeof data.stack === 'string') {
    sanitized.stack = sanitizeStack(data.stack);
  }

  return sanitized;
}

// Remove potentially sensitive information from strings
function sanitizeString(str: string): string {
  if (!str || typeof str !== 'string') return 'Invalid error message';
  
  // Remove email addresses
  str = str.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REMOVED]');
  
  // Remove potential tokens/API keys (long alphanumeric strings)
  str = str.replace(/[a-zA-Z0-9]{32,}/g, '[TOKEN_REMOVED]');
  
  // Remove URLs with query parameters that might contain sensitive data
  str = str.replace(/https?:\/\/[^\s]+\?[^\s]+/g, '[URL_WITH_PARAMS_REMOVED]');
  
  // Limit length to prevent large payloads
  return str.substring(0, 1000);
}

// Sanitize URLs to remove sensitive query parameters
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove all query parameters as they might contain sensitive data
    urlObj.search = '';
    return urlObj.toString();
  } catch {
    return '[INVALID_URL]';
  }
}

// Sanitize user agent to keep only browser/OS info
function sanitizeUserAgent(userAgent: string): string {
  // Keep only the basic browser and OS information, remove detailed version info
  const sanitized = userAgent
    .replace(/\([^)]*\)/g, '') // Remove detailed system info in parentheses
    .replace(/\/[\d.]+/g, '') // Remove version numbers
    .trim();
  
  return sanitized.substring(0, 200);
}

// Sanitize stack traces to remove file paths that might contain usernames
function sanitizeStack(stack: string): string {
  return stack
    .replace(/\/Users\/[^\/]+/g, '/Users/[USERNAME]')
    .replace(/\/home\/[^\/]+/g, '/home/[USERNAME]')
    .replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\[USERNAME]')
    .substring(0, 2000);
}

// Validate error data structure
function validateErrorData(data: any): data is ErrorData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Message is required
  if (!data.message || typeof data.message !== 'string') {
    return false;
  }

  // Optional fields validation
  if (data.source && typeof data.source !== 'string') {
    return false;
  }

  if (data.line && (typeof data.line !== 'number' || data.line < 0)) {
    return false;
  }

  if (data.column && (typeof data.column !== 'number' || data.column < 0)) {
    return false;
  }

  if (data.userAgent && typeof data.userAgent !== 'string') {
    return false;
  }

  if (data.url && typeof data.url !== 'string') {
    return false;
  }

  if (data.timestamp && typeof data.timestamp !== 'string') {
    return false;
  }

  if (data.stack && typeof data.stack !== 'string') {
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1';
    const rateLimitResult = errorLogRateLimiter.checkLimit(ip);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.'
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          }
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { 
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      );
    }

    // Validate error data
    if (!validateErrorData(body)) {
      return NextResponse.json(
        { 
          error: 'Invalid error data',
          message: 'Error data validation failed. Required: message (string)'
        },
        { status: 400 }
      );
    }

    // Sanitize error data
    const sanitizedError = sanitizeErrorData(body);

    // Log error based on environment
    if (process.env.NODE_ENV === 'development') {
      console.error('Client Error:', {
        ...sanitizedError,
        ip: ip.replace(/\d+/g, 'xxx'), // Anonymize IP in logs
        environment: 'development'
      });
    } else {
      // In production, you would typically send to an external logging service
      // For now, we'll just log to console with structured format
      console.error('PRODUCTION_CLIENT_ERROR', JSON.stringify({
        ...sanitizedError,
        environment: 'production',
        severity: 'error',
        source: 'client'
      }));

      // TODO: Send to external logging service
      // await sendToExternalLoggingService(sanitizedError);
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: 'Error logged successfully'
      },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        }
      }
    );

  } catch (error) {
    // Log server-side errors
    console.error('Error logging API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process error log'
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    },
    { status: 405 }
  );
}