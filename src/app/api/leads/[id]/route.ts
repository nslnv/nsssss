import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Authentication helper
function validateAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === process.env.ADMIN_TOKEN;
}

// XSS sanitization helper
function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '')
    .trim();
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    if (!validateAuth(request)) {
      return NextResponse.json({ 
        error: "Unauthorized access",
        code: "UNAUTHORIZED" 
      }, { status: 401 });
    }

    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Get lead by ID
    const lead = await db.select()
      .from(leads)
      .where(eq(leads.id, parseInt(id)))
      .limit(1);

    if (lead.length === 0) {
      return NextResponse.json({ 
        error: 'Lead not found',
        code: 'LEAD_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json(lead[0], { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    if (!validateAuth(request)) {
      return NextResponse.json({ 
        error: "Unauthorized access",
        code: "UNAUTHORIZED" 
      }, { status: 401 });
    }

    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if lead exists
    const existingLead = await db.select()
      .from(leads)
      .where(eq(leads.id, parseInt(id)))
      .limit(1);

    if (existingLead.length === 0) {
      return NextResponse.json({ 
        error: 'Lead not found',
        code: 'LEAD_NOT_FOUND'
      }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Validate status if provided
    if (body.status !== undefined) {
      const validStatuses = ['new', 'done'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ 
          error: "Status must be 'new' or 'done'",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
    }

    // Only allow status updates for security
    const allowedUpdates: { status?: string } = {};
    if (body.status !== undefined) {
      allowedUpdates.status = sanitizeText(body.status);
    }

    // If no valid updates provided
    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ 
        error: "No valid updates provided",
        code: "NO_UPDATES" 
      }, { status: 400 });
    }

    // Update lead
    const updated = await db.update(leads)
      .set(allowedUpdates)
      .where(eq(leads.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update lead',
        code: 'UPDATE_FAILED'
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}