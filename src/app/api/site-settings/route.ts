import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq, like, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(siteSettings)
        .where(eq(siteSettings.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Site setting not found' 
        }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'id';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(siteSettings);

    // Apply search filter
    if (search) {
      query = query.where(
        or(
          like(siteSettings.settingKey, `%${search}%`),
          like(siteSettings.description, `%${search}%`)
        )
      );
    }

    // Apply sorting
    const orderDirection = order === 'desc' ? desc : asc;
    if (sort === 'settingKey') {
      query = query.orderBy(orderDirection(siteSettings.settingKey));
    } else if (sort === 'updatedAt') {
      query = query.orderBy(orderDirection(siteSettings.updatedAt));
    } else {
      query = query.orderBy(orderDirection(siteSettings.id));
    }

    const results = await query.limit(limit).offset(offset);
    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.settingKey) {
      return NextResponse.json({ 
        error: "Setting key is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!body.settingValue) {
      return NextResponse.json({ 
        error: "Setting value is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Check if settingKey already exists
    const existingSetting = await db.select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, body.settingKey.trim()))
      .limit(1);

    if (existingSetting.length > 0) {
      return NextResponse.json({ 
        error: "Setting key already exists",
        code: "DUPLICATE_SETTING_KEY" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData = {
      settingKey: body.settingKey.trim(),
      settingValue: body.settingValue.trim(),
      description: body.description ? body.description.trim() : null,
      updatedAt: new Date().toISOString()
    };

    const newRecord = await db.insert(siteSettings)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "Setting key already exists",
        code: "DUPLICATE_SETTING_KEY" 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(siteSettings)
      .where(eq(siteSettings.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Site setting not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    
    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (body.settingValue !== undefined) {
      updates.settingValue = body.settingValue.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description ? body.description.trim() : null;
    }

    const updated = await db.update(siteSettings)
      .set(updates)
      .where(eq(siteSettings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(siteSettings)
      .where(eq(siteSettings.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Site setting not found' 
      }, { status: 404 });
    }

    const deleted = await db.delete(siteSettings)
      .where(eq(siteSettings.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Site setting deleted successfully',
      deletedRecord: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}