import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Allowed file types with their mime types
const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'chat-files');

// Sanitize filename by removing dangerous characters
function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts and special chars
  return fileName
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/[^a-zA-Z0-9.-_]/g, '_') // Replace special chars
    .slice(0, 100); // Limit length
}

// Generate secure unique filename
function generateUniqueFileName(originalName: string): string {
  const uuid = crypto.randomUUID();
  const sanitizedName = sanitizeFileName(originalName);
  const ext = path.extname(sanitizedName);
  const nameWithoutExt = path.basename(sanitizedName, ext);
  
  return `${uuid}-${nameWithoutExt}${ext}`;
}

// Validate file type and extension
function validateFileType(file: File): boolean {
  const fileExtension = path.extname(file.name).toLowerCase();
  
  // Check mime type exists in allowed list
  if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
    return false;
  }
  
  // Verify extension matches mime type
  const allowedExtensions = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
  return allowedExtensions.includes(fileExtension);
}

// Create upload directory if it doesn't exist
async function ensureUploadDirectory(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Chat file upload attempt');
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('File upload failed - no file provided');
      
      return NextResponse.json({
        ok: false,
        code: 'NO_FILE',
        error: 'No file provided'
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log('File upload failed - file too large:', file.size);
      
      return NextResponse.json({
        ok: false,
        code: 'FILE_TOO_LARGE',
        error: 'File size exceeds 10MB limit'
      }, { status: 400 });
    }

    // Validate file type
    if (!validateFileType(file)) {
      console.log('File upload failed - unsupported file type:', file.type);
      
      return NextResponse.json({
        ok: false,
        code: 'UNSUPPORTED_FILE_TYPE',
        error: 'Unsupported file type. Allowed: PDF, DOC, DOCX, TXT, Images'
      }, { status: 415 });
    }

    // Ensure upload directory exists
    await ensureUploadDirectory();

    // Generate secure filename
    const uniqueFileName = generateUniqueFileName(file.name);
    const filePath = path.join(UPLOAD_DIR, uniqueFileName);
    const publicPath = `/uploads/chat-files/${uniqueFileName}`;

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    console.log('Chat file uploaded successfully:', {
      originalName: file.name,
      savedName: uniqueFileName,
      fileSize: file.size,
      mimeType: file.type
    });

    // Return file info for chat integration
    return NextResponse.json({
      ok: true,
      id: crypto.randomUUID(), // Generate file ID for tracking
      name: file.name,
      url: publicPath,
      path: publicPath,
      type: file.type,
      size: file.size
    }, { status: 201 });

  } catch (error) {
    console.error('Chat file upload error:', error);

    return NextResponse.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      error: 'Internal server error during file upload'
    }, { status: 500 });
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({
    ok: false,
    code: 'METHOD_NOT_ALLOWED',
    error: 'Method not allowed. Use POST for file uploads.'
  }, { status: 405 });
}