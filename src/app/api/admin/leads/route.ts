import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, auditLogs } from '@/db/schema';
import { eq, like, and, or, desc, asc, count, gte, lte, inArray } from 'drizzle-orm';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

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

// CSV generation helper
function generateCSV(data: any[]): string {
  const headers = ['id', 'name', 'email', 'phone', 'workType', 'deadline', 'budget', 'description', 'source', 'status', 'createdAt', 'updatedAt'];
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes for CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
    const offset = (page - 1) * pageSize;
    
    // Parse search and filter parameters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const workType = searchParams.get('workType') || '';
    const source = searchParams.get('source') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    
    // Build base query
    let dbQuery = db.select().from(leads);
    let countQuery = db.select({ count: count() }).from(leads);
    
    // Build where conditions
    const conditions = [];
    
    // Search across name, email, description
    if (search.trim()) {
      const searchCondition = or(
        like(leads.name, `%${search}%`),
        like(leads.email, `%${search}%`),
        like(leads.description, `%${search}%`)
      );
      conditions.push(searchCondition);
    }
    
    // Filter by status
    if (status && ['new', 'read', 'in_progress', 'closed', 'archived'].includes(status)) {
      conditions.push(eq(leads.status, status));
    }

    // Filter by work type
    if (workType) {
      conditions.push(eq(leads.workType, workType));
    }

    // Filter by source
    if (source) {
      conditions.push(eq(leads.source, source));
    }

    // Date range filter
    if (dateFrom) {
      conditions.push(gte(leads.createdAt, dateFrom));
    }
    if (dateTo) {
      // Add end of day to dateTo
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(lte(leads.createdAt, endOfDay.toISOString()));
    }
    
    // Apply conditions
    if (conditions.length > 0) {
      const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
      dbQuery = dbQuery.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }
    
    // Apply sorting
    const orderDirection = order === 'desc' ? desc : asc;
    if (sort === 'name') {
      dbQuery = dbQuery.orderBy(orderDirection(leads.name));
    } else if (sort === 'email') {
      dbQuery = dbQuery.orderBy(orderDirection(leads.email));
    } else if (sort === 'status') {
      dbQuery = dbQuery.orderBy(orderDirection(leads.status));
    } else if (sort === 'workType') {
      dbQuery = dbQuery.orderBy(orderDirection(leads.workType));
    } else if (sort === 'updatedAt') {
      dbQuery = dbQuery.orderBy(orderDirection(leads.updatedAt));
    } else {
      dbQuery = dbQuery.orderBy(orderDirection(leads.createdAt));
    }

    // Apply pagination
    dbQuery = dbQuery.limit(pageSize).offset(offset);
    
    // Execute queries
    const [results, totalResult] = await Promise.all([
      dbQuery,
      countQuery
    ]);
    
    const total = Number(totalResult[0]?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    
    await logAudit('info', 'Admin accessed leads list', {
      adminUsername: authResult.admin?.username,
      page,
      search,
      status,
      workType,
      source,
      resultCount: results.length,
      filters: { dateFrom, dateTo, sort, order }
    });

    return NextResponse.json({
      ok: true,
      leads: results,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        availableStatuses: ['new', 'read', 'in_progress', 'closed', 'archived'],
        search,
        status,
        workType,
        source,
        dateFrom,
        dateTo,
        sort,
        order
      }
    });
    
  } catch (error) {
    console.error('GET admin leads error:', error);
    
    await logAudit('error', 'Admin leads listing error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action, ids } = body;

    // Handle CSV export
    if (action === 'export_csv') {
      // Get all leads for export (with filters if provided)
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status') || '';
      const workType = searchParams.get('workType') || '';
      const source = searchParams.get('source') || '';

      let query = db.select().from(leads);
      const conditions = [];

      if (status) conditions.push(eq(leads.status, status));
      if (workType) conditions.push(eq(leads.workType, workType));
      if (source) conditions.push(eq(leads.source, source));

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const allLeads = await query.orderBy(desc(leads.createdAt));
      const csvContent = generateCSV(allLeads);

      await logAudit('info', 'Admin exported leads to CSV', {
        adminUsername: authResult.admin?.username,
        leadCount: allLeads.length,
        filters: { status, workType, source }
      });

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="leads_export_${new Date().toISOString().split('T')[0]}.csv"`,
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Handle bulk delete
    if (action === 'bulk_delete') {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({
          ok: false,
          code: 'INVALID_IDS',
          error: 'Valid IDs array is required for bulk delete'
        }, { status: 400 });
      }

      // Validate IDs are numbers
      const numericIds = ids.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
      if (numericIds.length === 0) {
        return NextResponse.json({
          ok: false,
          code: 'INVALID_IDS',
          error: 'No valid numeric IDs provided'
        }, { status: 400 });
      }

      // Get leads before deletion for audit log
      const leadsToDelete = await db.select()
        .from(leads)
        .where(inArray(leads.id, numericIds));

      // Delete leads
      await db.delete(leads).where(inArray(leads.id, numericIds));

      await logAudit('warn', 'Admin bulk deleted leads', {
        adminUsername: authResult.admin?.username,
        deletedLeadIds: numericIds,
        deletedCount: leadsToDelete.length,
        deletedLeads: leadsToDelete.map(l => ({ id: l.id, name: l.name, email: l.email }))
      });

      return NextResponse.json({
        ok: true,
        message: `Successfully deleted ${leadsToDelete.length} leads`,
        deletedCount: leadsToDelete.length
      });
    }

    return NextResponse.json({
      ok: false,
      code: 'INVALID_ACTION',
      error: 'Invalid action. Supported actions: export_csv, bulk_delete'
    }, { status: 400 });
    
  } catch (error) {
    console.error('POST admin leads error:', error);
    
    await logAudit('error', 'Admin leads action error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      error: 'Internal server error'
    }, { status: 500 });
  }
}