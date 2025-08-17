import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contactMessages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';

const UPLOADS_DIR = path.join(process.cwd(), 'public/uploads/contact-files');
const MAX_FILENAME_LENGTH = 255;
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt', '.zip'];
const ADMIN_PASSWORD = "qweqweqwe112233";

const MIME_TYPES: { [key: string]: string } = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.txt': 'text/plain',
  '.zip': 'application/zip'
};

function validateFilename(filename: string): boolean {
  if (!filename || filename.length === 0 || filename.length > MAX_FILENAME_LENGTH) {
    return false;
  }

  // Prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }

  // Check for valid characters (alphanumeric, hyphens, underscores, dots)
  const validPattern = /^[a-zA-Z0-9._-]+$/;
  if (!validPattern.test(filename)) {
    return false;
  }

  // Check file extension
  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return false;
  }

  return true;
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7);
    return token === ADMIN_PASSWORD;
  } catch (error) {
    console.error('Admin auth verification error:', error);
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    if (!validateFilename(filename)) {
      return NextResponse.json({
        error: "Invalid filename format",
        code: "INVALID_FILENAME"
      }, { status: 400 });
    }

    const filePath = path.join(UPLOADS_DIR, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        error: "File not found",
        code: "FILE_NOT_FOUND"
      }, { status: 404 });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const mimeType = getMimeType(filename);

    // Handle range requests for large files
    const range = request.headers.get('range');
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunkSize = (end - start) + 1;

      const stream = createReadStream(filePath, { start, end });
      
      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    // Regular file serving
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('GET file error:', error);
    return NextResponse.json({
      error: 'Internal server error while serving file'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Verify admin authentication
    const isAdmin = await verifyAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json({
        error: "Admin authentication required",
        code: "UNAUTHORIZED"
      }, { status: 401 });
    }

    const filename = params.filename;

    if (!validateFilename(filename)) {
      return NextResponse.json({
        error: "Invalid filename format",
        code: "INVALID_FILENAME"
      }, { status: 400 });
    }

    const filePath = path.join(UPLOADS_DIR, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        error: "File not found",
        code: "FILE_NOT_FOUND"
      }, { status: 404 });
    }

    // Remove database references
    const relativeFilePath = `/uploads/contact-files/${filename}`;
    try {
      const updatedMessages = await db.update(contactMessages)
        .set({
          filePath: null
        })
        .where(eq(contactMessages.filePath, relativeFilePath))
        .returning();

      console.log(`Updated ${updatedMessages.length} contact messages to remove file reference`);
    } catch (dbError) {
      console.warn('Error updating database references:', dbError);
      // Continue with file deletion even if DB update fails
    }

    // Delete file from filesystem
    fs.unlinkSync(filePath);

    // Log the deletion for audit purposes
    console.log(`File deleted by admin: ${filename}`);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
      filename: filename
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE file error:', error);
    
    // Check if it's a file system error
    if ((error as any).code === 'ENOENT') {
      return NextResponse.json({
        error: "File not found",
        code: "FILE_NOT_FOUND"
      }, { status: 404 });
    }

    if ((error as any).code === 'EACCES') {
      return NextResponse.json({
        error: "Permission denied",
        code: "PERMISSION_DENIED"
      }, { status: 403 });
    }

    return NextResponse.json({
      error: 'Internal server error while deleting file'
    }, { status: 500 });
  }
}