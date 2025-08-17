import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leadFiles, auditLogs } from '@/db/schema';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip']
};

// File size limits
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 uploads per minute

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

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = `upload_${ip}`;
  
  // Clean up expired entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (now > v.resetTime) {
      rateLimitStore.delete(k);
    }
  }
  
  const current = rateLimitStore.get(key);
  
  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (current.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  current.count++;
  return true;
}

function sanitizeFilename(filename: string): string {
  // Remove directory traversal attempts and invalid characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .substring(0, 100);
}

function validateFileType(filename: string, mimeType: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  const allowedExtensions = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];
  
  if (!allowedExtensions) {
    return false;
  }
  
  return allowedExtensions.includes(ext);
}

async function logAudit(level: string, message: string, context: any = {}) {
  try {
    await db.insert(auditLogs).values({
      level,
      message,
      context: JSON.stringify(context),
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting check
    if (!checkRateLimit(clientIP)) {
      await logAudit('warn', 'Rate limit exceeded for file upload', { 
        ip: clientIP,
        endpoint: '/api/upload'
      });
      
      return NextResponse.json({
        ok: false,
        code: 'RATE_LIMIT_EXCEEDED',
        error: 'Too many upload attempts. Please try again later.'
      }, { status: 429 });
    }

    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json({
        ok: false,
        code: 'INVALID_CONTENT_TYPE',
        error: 'Request must be multipart/form-data'
      }, { status: 400 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({
        ok: false,
        code: 'NO_FILES',
        error: 'No files provided'
      }, { status: 400 });
    }

    // Validate total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json({
        ok: false,
        code: 'TOTAL_SIZE_EXCEEDED',
        error: `Total file size exceeds ${MAX_TOTAL_SIZE / 1024 / 1024}MB limit`
      }, { status: 400 });
    }

    // Validate individual files
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({
          ok: false,
          code: 'FILE_SIZE_EXCEEDED',
          error: `File ${file.name} exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
        }, { status: 400 });
      }

      if (!validateFileType(file.name, file.type)) {
        return NextResponse.json({
          ok: false,
          code: 'UNSUPPORTED_FILE_TYPE',
          error: `File type not supported: ${file.type}`
        }, { status: 400 });
      }
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'leads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedFiles = [];

    // Process each file
    for (const file of files) {
      const sanitizedFilename = sanitizeFilename(file.name);
      const uuid = uuidv4();
      const storageKey = `${uuid}-${sanitizedFilename}`;
      const filePath = path.join(uploadDir, storageKey);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filePath, buffer);

      // Insert file record into database
      const fileRecord = await db.insert(leadFiles).values({
        leadId: 0, // Temporary value, will be updated when linked to a lead
        filename: sanitizedFilename,
        storageKey,
        size: file.size,
        mimeType: file.type,
        createdAt: new Date().toISOString()
      }).returning();

      uploadedFiles.push({
        fileId: fileRecord[0].id,
        filename: sanitizedFilename,
        storageKey,
        size: file.size,
        mimeType: file.type
      });
    }

    // Log successful upload
    await logAudit('info', 'Files uploaded successfully', {
      ip: clientIP,
      fileCount: files.length,
      totalSize,
      files: uploadedFiles.map(f => ({
        fileId: f.fileId,
        filename: f.filename,
        size: f.size
      }))
    });

    return NextResponse.json({
      ok: true,
      files: uploadedFiles
    }, { status: 201 });

  } catch (error) {
    console.error('File upload error:', error);
    
    await logAudit('error', 'File upload failed', {
      ip: clientIP,
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json({
      ok: false,
      code: 'UPLOAD_FAILED',
      error: 'File upload failed: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    ok: false,
    code: 'METHOD_NOT_ALLOWED',
    error: 'GET method not supported on upload endpoint'
  }, { status: 405 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({
    ok: false,
    code: 'METHOD_NOT_ALLOWED',
    error: 'PUT method not supported on upload endpoint'
  }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    ok: false,
    code: 'METHOD_NOT_ALLOWED',
    error: 'DELETE method not supported on upload endpoint'
  }, { status: 405 });
}