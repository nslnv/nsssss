import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ADMIN_PASSWORD = "qweqweqwe112233";
const UPLOADS_DIR = path.join(process.cwd(), 'public/uploads/contact-files');

// Simple admin authentication
async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
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

export async function GET(request: NextRequest) {
  try {
    // Admin authentication
    const isAuthenticated = await verifyAdminAuth(request);
    if (!isAuthenticated) {
      return NextResponse.json({ 
        error: "Admin authentication required",
        code: "UNAUTHORIZED" 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const fileType = searchParams.get('fileType');
    const sort = searchParams.get('sort') || 'uploadDate';
    const order = searchParams.get('order') || 'desc';

    // Validate sort parameters
    const validSortFields = ['uploadDate', 'fileSize', 'filename'];
    if (!validSortFields.includes(sort)) {
      return NextResponse.json({ 
        error: "Invalid sort field. Must be one of: uploadDate, fileSize, filename",
        code: "INVALID_SORT_FIELD" 
      }, { status: 400 });
    }

    const validOrderValues = ['asc', 'desc'];
    if (!validOrderValues.includes(order)) {
      return NextResponse.json({ 
        error: "Invalid order value. Must be 'asc' or 'desc'",
        code: "INVALID_ORDER" 
      }, { status: 400 });
    }

    // Check if upload directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
      return NextResponse.json({
        files: [],
        pagination: {
          total: 0,
          limit: limit,
          offset: offset,
          hasMore: false
        }
      });
    }

    // Read files from directory
    const files = fs.readdirSync(UPLOADS_DIR);
    const fileDetails = [];

    for (const filename of files) {
      const filePath = path.join(UPLOADS_DIR, filename);
      
      try {
        const stats = fs.statSync(filePath);
        const ext = path.extname(filename).toLowerCase();

        // Apply file type filter
        if (fileType && ext !== fileType.toLowerCase()) {
          continue;
        }

        // Apply search filter
        if (search && !filename.toLowerCase().includes(search.toLowerCase())) {
          continue;
        }

        // Determine MIME type based on extension
        const mimeTypeMap: { [key: string]: string } = {
          '.pdf': 'application/pdf',
          '.doc': 'application/msword',
          '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          '.txt': 'text/plain',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.zip': 'application/zip',
          '.rar': 'application/x-rar-compressed'
        };

        const mimeType = mimeTypeMap[ext] || 'application/octet-stream';

        fileDetails.push({
          filename: filename,
          originalName: filename,
          filePath: `/uploads/contact-files/${filename}`,
          fileSize: stats.size,
          mimeType: mimeType,
          uploadDate: stats.birthtime.toISOString(),
          exists: true,
          lastModified: stats.mtime.toISOString()
        });

      } catch (error) {
        console.error(`Error processing file ${filename}:`, error);
        continue;
      }
    }

    // Sort files
    fileDetails.sort((a, b) => {
      let aValue, bValue;
      
      switch (sort) {
        case 'uploadDate':
          aValue = new Date(a.uploadDate).getTime();
          bValue = new Date(b.uploadDate).getTime();
          break;
        case 'fileSize':
          aValue = a.fileSize;
          bValue = b.fileSize;
          break;
        case 'filename':
          aValue = a.filename.toLowerCase();
          bValue = b.filename.toLowerCase();
          break;
        default:
          aValue = new Date(a.uploadDate).getTime();
          bValue = new Date(b.uploadDate).getTime();
      }

      if (order === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    // Apply pagination
    const total = fileDetails.length;
    const paginatedFiles = fileDetails.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    // Log successful operation
    console.log(`Admin files list retrieved: ${paginatedFiles.length} files (${total} total)`);

    return NextResponse.json({
      files: paginatedFiles,
      pagination: {
        total: total,
        limit: limit,
        offset: offset,
        hasMore: hasMore
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET admin files error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}