import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, auditLogs } from '@/db/schema';
import { z } from 'zod';

// Rate limiting storage (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Validation schema for lead creation
const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format').max(100, 'Email too long'),
  phone: z.string().regex(/^\+?\d[\d\s\-()]{7,}$/, 'Invalid phone format').optional().or(z.literal('')),
  workType: z.string().min(1, 'Work type is required').max(100, 'Work type too long'),
  deadline: z.string().optional().nullable(),
  budget: z.string().max(50, 'Budget too long').optional().nullable(),
  description: z.string().min(1, 'Description is required').max(5000, 'Description too long'),
  source: z.string().max(100, 'Source too long').optional(),
  honeypot: z.string().max(0, 'Honeypot field should be empty').optional(),
});

// Rate limiting helper
function checkRateLimit(ip: string): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 3; // 3 requests per minute

  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    const newRecord = { count: 1, resetTime: now + windowMs };
    rateLimitMap.set(ip, newRecord);
    return { success: true, remaining: maxRequests - 1, resetTime: newRecord.resetTime };
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { success: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
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

// Helper function to send email notification (implement with your preferred service)
async function sendNotification(lead: any) {
  // In a real implementation, integrate with email service like Resend, SendGrid, etc.
  console.log('New lead notification:', {
    name: lead.name,
    email: lead.email,
    workType: lead.workType
  });
  
  // Example with Resend (uncomment and configure if needed):
  /*
  if (process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@example.com',
        to: process.env.NOTIFICATION_EMAIL,
        subject: `Новая заявка от ${lead.name}`,
        html: `
          <h2>Новая заявка на сайте</h2>
          <p><strong>Имя:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Телефон:</strong> ${lead.phone || 'Не указан'}</p>
          <p><strong>Тип работы:</strong> ${lead.workType}</p>
          <p><strong>Дедлайн:</strong> ${lead.deadline || 'Не указан'}</p>
          <p><strong>Бюджет:</strong> ${lead.budget || 'Не указан'}</p>
          <p><strong>Описание:</strong> ${lead.description}</p>
          <p><strong>Источник:</strong> ${lead.source || 'Прямая заявка'}</p>
          <p><strong>Дата:</strong> ${new Date().toLocaleString('ru-RU')}</p>
        `,
      });

      await logAudit('info', 'Email notification sent', { leadId: lead.id });
    } catch (error) {
      await logAudit('error', 'Failed to send email notification', {
        leadId: lead.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  */
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip ?? '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Rate limiting check
    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.success) {
      await logAudit('warn', 'Lead creation rate limit exceeded', { 
        ip, 
        userAgent 
      });
      
      return NextResponse.json({
        ok: false,
        code: 'RATE_LIMIT_EXCEEDED',
        error: 'Too many requests. Please try again later.'
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '3',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        }
      });
    }

    const body = await request.json();

    // Validate input
    const validation = createLeadSchema.safeParse(body);
    if (!validation.success) {
      await logAudit('warn', 'Lead creation validation failed', {
        errors: validation.error.errors,
        ip,
        userAgent
      });
      
      return NextResponse.json({
        ok: false,
        code: 'VALIDATION_ERROR',
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 });
    }

    const { name, email, phone, workType, deadline, budget, description, source, honeypot } = validation.data;

    // Check honeypot for spam protection
    if (honeypot && honeypot.trim() !== '') {
      await logAudit('warn', 'Honeypot triggered - potential spam', {
        honeypot,
        ip,
        userAgent,
        name,
        email
      });
      
      return NextResponse.json({
        ok: false,
        code: 'SPAM_DETECTED',
        error: 'Spam detection triggered'
      }, { status: 400 });
    }

    // Create lead
    const now = new Date().toISOString();
    const leadData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || null,
      workType: workType.trim(),
      deadline: deadline || null,
      budget: budget || null,
      description: description.trim(),
      source: source?.trim() || 'website',
      status: 'new' as const,
      createdAt: now,
      updatedAt: now,
    };

    const [newLead] = await db.insert(leads).values(leadData).returning();

    // Send notification (non-blocking)
    sendNotification(newLead).catch(console.error);

    await logAudit('info', 'New lead created successfully', {
      leadId: newLead.id,
      email: newLead.email,
      workType: newLead.workType,
      source: newLead.source,
      ip,
      userAgent
    });

    return NextResponse.json({
      ok: true,
      id: newLead.id,
      message: 'Lead created successfully'
    }, { 
      status: 201,
      headers: {
        'X-RateLimit-Limit': '3',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
      }
    });

  } catch (error) {
    console.error('Lead creation error:', error);
    
    await logAudit('error', 'Lead creation system error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
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

// Only allow POST requests for public lead creation
export async function GET() {
  return NextResponse.json({
    ok: false,
    code: 'METHOD_NOT_ALLOWED',
    error: 'Method not allowed. Use POST to create leads.'
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    ok: false,
    code: 'METHOD_NOT_ALLOWED',
    error: 'Method not allowed. Use POST to create leads.'
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    ok: false,
    code: 'METHOD_NOT_ALLOWED',
    error: 'Method not allowed. Use POST to create leads.'
  }, { status: 405 });
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