import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import { z } from 'zod';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

// Validation schema for lead updates
const updateLeadSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  workType: z.string().min(1).max(100).optional(),
  deadline: z.string().optional().nullable(),
  budget: z.string().max(50).optional().nullable(),
  description: z.string().min(1).max(5000).optional(),
  source: z.string().max(50).optional().nullable(),
  status: z.enum(['new', 'read', 'in_progress', 'closed', 'archived']).optional()
});

// Helper function to verify JWT and extract admin info
async function verifyAdminToken(request: NextRequest): Promise<{ success: boolean; admin?: any; error?: string }> {
  try {
    const cookie = request.cookies.get('admin_session');
    if (!cookie?.value) {
      return { success: false, error: 'No session cookie found' };
    }

    const { payload } = await jwtVerify(cookie.value, JWT_SECRET);
    return { 
      success: true, 
      admin: { 
        id: payload.sub, 
        username: payload.username, 
        role: payload.role 
      } 
    };
  } catch (error) {
    return { success: false, error: 'Invalid or expired token' };
  }
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({
        ok: false,
        code: 'UNAUTHORIZED',
        error: 'Admin authentication required'
      }, { status: 401 });
    }

    const id = params.id;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        ok: false,
        code: 'INVALID_ID',
        error: 'Valid ID is required'
      }, { status: 400 });
    }

    // Get lead by ID
    const lead = await db.select()
      .from(leads)
      .where(eq(leads.id, parseInt(id)))
      .limit(1);

    if (lead.length === 0) {
      return NextResponse.json({
        ok: false,
        code: 'LEAD_NOT_FOUND',
        error: 'Lead not found'
      }, { status: 404 });
    }

    await logAudit('info', 'Admin viewed lead details', {
      adminUsername: authResult.admin?.username,
      leadId: parseInt(id),
      leadEmail: lead[0].email
    });

    return NextResponse.json({
      ok: true,
      lead: lead[0]
    });

  } catch (error) {
    console.error('GET lead error:', error);
    
    await logAudit('error', 'Admin lead details error', {
      leadId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({
        ok: false,
        code: 'UNAUTHORIZED',
        error: 'Admin authentication required'
      }, { status: 401 });
    }

    const id = params.id;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        ok: false,
        code: 'INVALID_ID',
        error: 'Valid ID is required'
      }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateLeadSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        ok: false,
        code: 'VALIDATION_ERROR',
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 });
    }

    // Check if lead exists and get current data
    const existingLead = await db.select()
      .from(leads)
      .where(eq(leads.id, parseInt(id)))
      .limit(1);

    if (existingLead.length === 0) {
      return NextResponse.json({
        ok: false,
        code: 'LEAD_NOT_FOUND',
        error: 'Lead not found'
      }, { status: 404 });
    }

    const updates = validation.data;
    
    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Update lead
    const updated = await db.update(leads)
      .set(updateData)
      .where(eq(leads.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({
        ok: false,
        code: 'UPDATE_FAILED',
        error: 'Failed to update lead'
      }, { status: 500 });
    }

    // Create audit log with changes
    const changes: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (existingLead[0][key as keyof typeof existingLead[0]] !== value) {
        changes[key] = {
          from: existingLead[0][key as keyof typeof existingLead[0]],
          to: value
        };
      }
    }

    await logAudit('info', 'Admin updated lead', {
      adminUsername: authResult.admin?.username,
      leadId: parseInt(id),
      leadEmail: existingLead[0].email,
      changes
    });

    return NextResponse.json({
      ok: true,
      lead: updated[0],
      message: 'Lead updated successfully'
    });

  } catch (error) {
    console.error('PATCH lead error:', error);
    
    await logAudit('error', 'Admin lead update error', {
      leadId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({
        ok: false,
        code: 'UNAUTHORIZED',
        error: 'Admin authentication required'
      }, { status: 401 });
    }

    const id = params.id;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        ok: false,
        code: 'INVALID_ID',
        error: 'Valid ID is required'
      }, { status: 400 });
    }

    // Check if lead exists and get data for audit log
    const existingLead = await db.select()
      .from(leads)
      .where(eq(leads.id, parseInt(id)))
      .limit(1);

    if (existingLead.length === 0) {
      return NextResponse.json({
        ok: false,
        code: 'LEAD_NOT_FOUND',
        error: 'Lead not found'
      }, { status: 404 });
    }

    // Delete the lead
    await db.delete(leads)
      .where(eq(leads.id, parseInt(id)));

    await logAudit('warn', 'Admin deleted lead', {
      adminUsername: authResult.admin?.username,
      leadId: parseInt(id),
      deletedLead: {
        name: existingLead[0].name,
        email: existingLead[0].email,
        workType: existingLead[0].workType,
        status: existingLead[0].status,
        createdAt: existingLead[0].createdAt
      }
    });

    return NextResponse.json({
      ok: true,
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    console.error('DELETE lead error:', error);
    
    await logAudit('error', 'Admin lead deletion error', {
      leadId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      error: 'Internal server error'
    }, { status: 500 });
  }
}