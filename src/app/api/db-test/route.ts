import { NextResponse } from 'next/server';
import { db } from '@/db';
import { contactFormsWorking } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  const testResults = {
    timestamp: new Date().toISOString(),
    connection: null,
    contactFormsTable: null,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      tursoUrl: process.env.TURSO_CONNECTION_URL ? 'Set' : 'Missing',
      tursoToken: process.env.TURSO_AUTH_TOKEN ? 'Set' : 'Missing',
    },
    error: null,
  };

  try {
    // Test basic database connection
    console.log('Testing Turso/LibSQL database connection...');
    
    const testQuery = await db.execute(sql`SELECT 1 as test`);
    testResults.connection = {
      status: 'success',
      message: 'Database connection established successfully',
      testResult: testQuery.rows,
    };

    // Check contact_forms_working table
    console.log('Analyzing contact_forms_working table...');
    
    try {
      // Get table info using SQLite pragma
      const tableInfo = await db.execute(sql`PRAGMA table_info(contact_forms_working)`);
      
      // Get total row count
      const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM contact_forms_working`);
      
      // Get sample data (first 5 rows)
      const sampleData = await db.select()
        .from(contactFormsWorking)
        .limit(5);

      testResults.contactFormsTable = {
        exists: true,
        structure: tableInfo.rows,
        totalRows: countResult.rows[0].count,
        sampleData: sampleData,
      };
      
    } catch (tableError) {
      console.error('Table analysis failed:', tableError);
      testResults.contactFormsTable = {
        exists: false,
        error: tableError.message,
      };
    }

    console.log('Database test completed successfully');

  } catch (error) {
    console.error('Database test failed:', error);
    
    testResults.error = {
      message: error.message,
      name: error.name,
      cause: error.cause,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };

    testResults.connection = {
      status: 'failed',
      message: 'Unable to connect to database',
      error: error.message,
    };
  }

  // Return appropriate HTTP status based on results
  const hasErrors = testResults.error !== null;
  const status = hasErrors ? 500 : 200;

  return NextResponse.json(testResults, { status });
}