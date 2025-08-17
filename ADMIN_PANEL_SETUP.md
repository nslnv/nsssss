# Admin Panel Setup Documentation

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Installation Steps](#installation-steps)
6. [Security Configuration](#security-configuration)
7. [Deployment Checklist](#deployment-checklist)
8. [Troubleshooting](#troubleshooting)
9. [API Documentation](#api-documentation)
10. [Maintenance](#maintenance)

---

## Overview

This admin panel provides a comprehensive management interface for your application with the following features:

- **User Management**: Create, edit, and manage user accounts with role-based access control
- **Content Management**: Manage posts, pages, and media files
- **Analytics Dashboard**: Real-time statistics and performance metrics
- **System Configuration**: Application settings and feature toggles
- **Audit Logging**: Complete activity tracking and security monitoring

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Shadcn/UI with Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **File Storage**: AWS S3 or local storage
- **Monitoring**: Winston logging with structured data

---

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: Version 18.17.0 or higher
- **npm**: Version 9.0.0 or higher (or yarn/pnpm equivalent)
- **PostgreSQL**: Version 14.0 or higher
- **Git**: For version control
- **Docker** (optional): For containerized deployment

### System Requirements

**Development Environment:**
- RAM: Minimum 8GB, Recommended 16GB
- Storage: At least 10GB free space
- OS: Windows 10+, macOS 10.15+, or Linux

**Production Environment:**
- RAM: Minimum 4GB, Recommended 8GB+
- CPU: 2+ cores
- Storage: 50GB+ SSD recommended
- Network: Stable internet connection for external services

---

## Environment Configuration

Create a `.env.local` file in your project root with the following variables:

### Required Variables

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/admin_panel_db"
DIRECT_URL="postgresql://username:password@localhost:5432/admin_panel_db"

# Authentication
NEXTAUTH_SECRET="your-super-secure-32-character-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# JWT Configuration
JWT_SECRET="another-super-secure-secret-for-jwt-tokens"

# Admin User (Initial Setup)
ADMIN_EMAIL="admin@yourcompany.com"
ADMIN_PASSWORD="secure-initial-password-change-immediately"

# Application Configuration
APP_NAME="Admin Panel"
APP_URL="http://localhost:3000"
NODE_ENV="development"
### Optional Variables

# File Upload Configuration
UPLOAD_MAX_SIZE="10485760" # 10MB in bytes
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp,application/pdf"

# AWS S3 Configuration (if using cloud storage)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET_NAME="your-bucket-name"

# Email Configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Redis Configuration (for session storage)
REDIS_URL="redis://localhost:6379"

# Monitoring & Analytics
SENTRY_DSN="your-sentry-dsn-url"
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"

# Rate Limiting
RATE_LIMIT_MAX="100" # requests per window
RATE_LIMIT_WINDOW="900000" # 15 minutes in milliseconds

# Security Headers
CORS_ORIGIN="http://localhost:3000"
CSP_POLICY="default-src 'self'; script-src 'self' 'unsafe-inline'"
### Environment-Specific Configurations

**Development (.env.local):**
NODE_ENV="development"
LOG_LEVEL="debug"
ENABLE_DEBUG_LOGS="true"
DISABLE_AUTH_RATE_LIMIT="true"
**Production (.env.production):**
NODE_ENV="production"
LOG_LEVEL="warn"
ENABLE_DEBUG_LOGS="false"
FORCE_HTTPS="true"
SESSION_SECURE="true"
---

## Database Setup

### PostgreSQL Installation

**On macOS (using Homebrew):**
brew install postgresql@14
brew services start postgresql@14
**On Ubuntu/Debian:**
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
**On Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### Database Creation

1. **Connect to PostgreSQL:**
sudo -u postgres psql
2. **Create database and user:**
CREATE DATABASE admin_panel_db;
CREATE USER admin_panel_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE admin_panel_db TO admin_panel_user;
ALTER USER admin_panel_user CREATEDB;
\q
3. **Test connection:**
psql -h localhost -U admin_panel_user -d admin_panel_db -W
### Database Schema

The system uses Prisma for database management. The main tables include:

#### Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
#### Posts Table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  author_id UUID REFERENCES users(id),
  featured_image TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
#### Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
### Prisma Schema Setup

Your `prisma/schema.prisma` should include:

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  passwordHash String  @map("password_hash")
  role        UserRole @default(USER)
  avatarUrl   String?  @map("avatar_url")
  isActive    Boolean  @default(true) @map("is_active")
  lastLoginAt DateTime? @map("last_login_at")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  posts       Post[]
  auditLogs   AuditLog[]

  @@map("users")
}

model Post {
  id           String    @id @default(cuid())
  title        String
  slug         String    @unique
  content      String?
  excerpt      String?
  status       PostStatus @default(DRAFT)
  authorId     String    @map("author_id")
  featuredImage String?  @map("featured_image")
  publishedAt  DateTime? @map("published_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  author       User      @relation(fields: [authorId], references: [id])

  @@map("posts")
}

model AuditLog {
  id           String   @id @default(cuid())
  userId       String?  @map("user_id")
  action       String
  resourceType String   @map("resource_type")
  resourceId   String?  @map("resource_id")
  metadata     Json?
  ipAddress    String?  @map("ip_address")
  userAgent    String?  @map("user_agent")
  createdAt    DateTime @default(now()) @map("created_at")

  user         User?    @relation(fields: [userId], references: [id])

  @@map("audit_logs")
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  EDITOR
  USER
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
---

## Installation Steps

### 1. Clone and Setup

# Clone the repository
git clone <repository-url> admin-panel
cd admin-panel

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
### 2. Configure Environment

Edit `.env.local` with your specific values:
nano .env.local
### 3. Database Migration

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed initial data (optional)
npx prisma db seed
### 4. Create Initial Admin User

Run the setup script:
npm run setup:admin
Or create manually:
npm run create-admin -- --email="admin@example.com" --password="secure_password" --name="Admin User"
### 5. Start Development Server

# Start development server
npm run dev

# Server will be available at http://localhost:3000
### 6. Verify Installation

1. Open browser to `http://localhost:3000/admin`
2. Login with your admin credentials
3. Check all dashboard sections load correctly
4. Test user creation and permissions

---

## Security Configuration

### Authentication & Authorization

The admin panel implements multi-layered security:

#### JWT Token Configuration
// JWT tokens expire after 24 hours
const JWT_EXPIRY = '24h';

// Refresh tokens expire after 30 days
const REFRESH_TOKEN_EXPIRY = '30d';

// Token rotation on each request
const ROTATE_TOKENS = true;
#### Role-Based Access Control (RBAC)

enum UserRole {
  SUPER_ADMIN = 'super_admin', // Full system access
  ADMIN = 'admin',             // User and content management
  EDITOR = 'editor',           // Content management only
  USER = 'user'                // Read-only access
}

const permissions = {
  super_admin: ['*'], // All permissions
  admin: ['users:read', 'users:write', 'posts:read', 'posts:write', 'analytics:read'],
  editor: ['posts:read', 'posts:write', 'media:read', 'media:write'],
  user: ['posts:read', 'profile:read', 'profile:write']
};
### Security Headers

Implement these security headers in `next.config.js`:

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'none';"
  }
];
### Input Validation & Sanitization

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// User input validation schema
const userSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  password: z.string().min(8).max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
});

// Content sanitization
const sanitizeHtml = (content: string) => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: ['href', 'target']
  });
};
### Rate Limiting

import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per window
  message: 'Rate limit exceeded, please slow down.',
});
### File Upload Security

const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ],
  maxFiles: 5,
  virusScan: true, // Enable if antivirus scanning is available
  generateSecureFilename: true
};

// File validation function
const validateFile = (file: File) => {
  if (file.size > uploadConfig.maxFileSize) {
    throw new Error('File size exceeds limit');
  }
  
  if (!uploadConfig.allowedMimeTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }
  
  // Additional checks for file headers to prevent disguised malicious files
  return true;
};
---

## Deployment Checklist

### Pre-Deployment Security Review

- [ ] **Environment Variables**: All production secrets are set and secure
- [ ] **Database**: Production database is configured with proper user permissions
- [ ] **HTTPS**: SSL certificates are installed and configured
- [ ] **Firewall**: Only necessary ports are open (80, 443, SSH)
- [ ] **Backups**: Automated backup system is configured
- [ ] **Monitoring**: Error tracking and performance monitoring are set up

### Production Environment Setup

#### 1. Server Configuration

**Recommended Server Specifications:**
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB+ recommended
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 20.04+ LTS or similar

#### 2. Install Dependencies

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2 for process management
npm install -g pm2
#### 3. Application Deployment

# Clone repository
git clone <repository-url> /var/www/admin-panel
cd /var/www/admin-panel

# Install dependencies
npm ci --production

# Set up environment
cp .env.example .env.production
nano .env.production

# Build application
npm run build

# Start with PM2
pm2 start npm --name "admin-panel" -- start
pm2 save
pm2 startup
#### 4. Nginx Configuration

Create `/etc/nginx/sites-available/admin-panel`:

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
Enable the site:
sudo ln -s /etc/nginx/sites-available/admin-panel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
#### 5. Database Production Setup

# Create production database
sudo -u postgres createdb admin_panel_production
sudo -u postgres createuser admin_panel_prod

# Set password and permissions
sudo -u postgres psql -c "ALTER USER admin_panel_prod PASSWORD 'secure_production_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE admin_panel_production TO admin_panel_prod;"

# Run migrations
cd /var/www/admin-panel
npx prisma db push --accept-data-loss
#### 6. SSL Certificate Setup (Let's Encrypt)

# Install Certbot
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
### Post-Deployment Verification

- [ ] **Site Access**: Confirm the site loads properly over HTTPS
- [ ] **Authentication**: Test login functionality works
- [ ] **Database**: Verify database connections and operations
- [ ] **File Uploads**: Test file upload functionality
- [ ] **Email**: Confirm email notifications are working
- [ ] **Monitoring**: Check that all monitoring tools are active
- [ ] **Backups**: Verify automated backups are running
- [ ] **Performance**: Run performance tests and optimization

### Monitoring Setup

#### Application Monitoring with PM2

# Monitor application
pm2 monit

# Check logs
pm2 logs admin-panel

# Restart if needed
pm2 restart admin-panel

# Set up log rotation
pm2 install pm2-logrotate
#### System Monitoring

Install monitoring tools:
# Install htop for system monitoring
sudo apt install htop

# Install fail2ban for intrusion prevention
sudo apt install fail2ban
sudo systemctl enable fail2ban
---

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues

**Problem**: `Error: P1001: Can't reach database server at localhost:5432`

**Solutions**:
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if stopped
sudo systemctl start postgresql

# Check database exists
sudo -u postgres psql -l

# Verify credentials in .env file
cat .env.local | grep DATABASE_URL

# Test connection manually
psql -h localhost -U your_username -d your_database -W
#### 2. Authentication Errors

**Problem**: `NextAuth Error: Invalid JWT token`

**Solutions**:
# Regenerate NEXTAUTH_SECRET
openssl rand -base64 32

# Clear browser cookies and localStorage
# Check NEXTAUTH_URL matches your domain

# Verify JWT_SECRET is set
echo $JWT_SECRET
#### 3. File Upload Issues

**Problem**: Files not uploading or returning 413 errors

**Solutions**:
# Check Nginx client_max_body_size
sudo nginx -T | grep client_max_body_size

# Increase in Nginx config
client_max_body_size 10M;

# Check Node.js file size limits in next.config.js
# Verify disk space
df -h

# Check file permissions
ls -la uploads/
sudo chown -R www-data:www-data uploads/
#### 4. Performance Issues

**Problem**: Slow page load times or high memory usage

**Solutions**:
# Check system resources
htop
free -h
df -h

# Monitor Node.js process
pm2 monit

# Check database performance
# Look for slow queries in PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Optimize database
sudo -u postgres psql your_database -c "VACUUM ANALYZE;"

# Check for memory leaks
# Review application logs for errors
pm2 logs admin-panel --lines 100
#### 5. SSL Certificate Issues

**Problem**: SSL certificate not working or expired

**Solutions**:
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test Nginx configuration
sudo nginx -t

# Check certificate expiry
openssl x509 -in /path/to/cert.pem -text -noout | grep "Not After"
### Debug Mode Setup

Enable detailed logging for troubleshooting:

# Set environment variables for debugging
export NODE_ENV=development
export LOG_LEVEL=debug
export ENABLE_DEBUG_LOGS=true

# Start application with debug logging
npm run dev

# Or for production debugging
NODE_ENV=production LOG_LEVEL=debug npm start
### Log File Locations

# Application logs (PM2)
~/.pm2/logs/

# Nginx logs
/var/log/nginx/access.log
/var/log/nginx/error.log

# PostgreSQL logs
/var/log/postgresql/

# System logs
/var/log/syslog
/var/log/auth.log
### Performance Optimization

#### Database Optimization

-- Add indexes for better query performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_posts_author_status ON posts(author_id, status);
CREATE INDEX CONCURRENTLY idx_posts_slug ON posts(slug);
CREATE INDEX CONCURRENTLY idx_audit_logs_user_created ON audit_logs(user_id, created_at);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';
#### Application Optimization

# Enable gzip compression in Nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

# Optimize images
npm install sharp
# Use Next.js Image component with optimization

# Enable caching headers
add_header Cache-Control "public, max-age=31536000" always;
---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password.

**Request Body:**
{
  "email": "user@example.com",
  "password": "secure_password"
}
**Response:**
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  }
}
#### POST /api/auth/logout
Logout and invalidate token.

**Headers:**
Authorization: Bearer your_jwt_token
**Response:**
{
  "success": true,
  "message": "Logged out successfully"
}
### User Management Endpoints

#### GET /api/users
Get list of users (paginated).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search by name or email
- `role`: Filter by role
- `status`: Filter by active/inactive status

**Response:**
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "email": "user@example.com",
        "name": "User Name",
        "role": "admin",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
#### POST /api/users
Create new user.

**Request Body:**
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "secure_password",
  "role": "editor"
}
**Response:**
{
  "success": true,
  "data": {
    "user": {
      "id": "new_user_id",
      "email": "newuser@example.com",
      "name": "New User",
      "role": "editor",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
#### PUT /api/users/[id]
Update existing user.

**Request Body:**
{
  "name": "Updated Name",
  "role": "admin",
  "isActive": true
}
#### DELETE /api/users/[id]
Delete user (soft delete).

**Response:**
{
  "success": true,
  "message": "User deleted successfully"
}
### Content Management Endpoints

#### GET /api/posts
Get list of posts.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status (draft, published, archived)
- `author`: Filter by author ID
- `search`: Search in title and content

#### POST /api/posts
Create new post.

**Request Body:**
{
  "title": "Post Title",
  "slug": "post-title",
  "content": "Post content here...",
  "excerpt": "Short description",
  "status": "draft",
  "featuredImage": "https://example.com/image.jpg"
}
#### PUT /api/posts/[id]
Update existing post.

#### DELETE /api/posts/[id]
Delete post.

### File Upload Endpoints

#### POST /api/upload
Upload file(s).

**Request:** Multipart form data with file(s)

**Response:**
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "file_id",
        "filename": "original-filename.jpg",
        "url": "https://example.com/uploads/secure-filename.jpg",
        "size": 1024576,
        "mimeType": "image/jpeg"
      }
    ]
  }
}
### Analytics Endpoints

#### GET /api/analytics/dashboard
Get dashboard statistics.

**Response:**
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "active": 1100,
      "growth": "+15%"
    },
    "posts": {
      "total": 450,
      "published": 380,
      "growth": "+8%"
    },
    "traffic": {
      "visits": 15000,
      "pageviews": 45000,
      "growth": "+22%"
    }
  }
}
### Error Responses

All endpoints return consistent error responses:

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
**Common Error Codes:**
- `VALIDATION_ERROR`: Invalid input data
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## Maintenance

### Regular Maintenance Tasks

#### Daily Tasks
- Monitor application logs for errors
- Check system resource usage
- Verify backup completion
- Review security alerts

#### Weekly Tasks
- Update dependencies (security patches)
- Analyze performance metrics
- Review user activity and audit logs
- Test backup restoration process

#### Monthly Tasks
- Full security audit
- Performance optimization review
- Database maintenance and cleanup
- Update documentation

### Backup Strategy

#### Database Backups

**Daily automated backups:**
#!/bin/bash
# /etc/cron.daily/backup-admin-panel

BACKUP_DIR="/var/backups/admin-panel"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="admin_panel_production"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
sudo -u postgres pg_dump $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://your-backup-bucket/admin-panel/
#### Application Backups

**File system backups:**
#!/bin/bash
# Backup application files and uploads

tar -czf /var/backups/admin-panel/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=logs \
    /var/www/admin-panel
### Security Updates

#### Automated Security Scanning

# Install and configure security tools
npm install -g npm-audit
npm install -g retire

# Create security scan script
#!/bin/bash
# /etc/cron.weekly/security-scan

cd /var/www/admin-panel

# Check for npm vulnerabilities
npm audit --audit-level high

# Check for retired JavaScript libraries
retire --path .

# Update system packages
apt update && apt list --upgradable
#### Security Monitoring

Set up automated alerts for:
- Failed login attempts (>5 in 15 minutes)
- Unusual file access patterns
- High CPU/memory usage
- Database connection errors
- SSL certificate expiry (30 days before)

### Performance Monitoring

#### Key Metrics to Track

1. **Response Times**
   - API endpoint response times
   - Page load times
   - Database query times

2. **Resource Usage**
   - CPU utilization
   - Memory usage
   - Disk space
   - Network bandwidth

3. **Application Metrics**
   - Active user sessions
   - Error rates
   - Database connection pool usage

#### Monitoring Setup with PM2

# Install PM2 monitoring
pm2 install pm2-server-monit

# Set up custom monitoring
pm2 set pm2-server-monit:monitor true
pm2 set pm2-server-monit:port 8080

# Create monitoring dashboard
pm2 web
### Troubleshooting Runbook

#### High CPU Usage
1. Check PM2 process status: `pm2 list`
2. Monitor system: `htop`
3. Check for memory leaks: `pm2 monit`
4. Review application logs: `pm2 logs`
5. Restart if necessary: `pm2 restart admin-panel`

#### Database Performance Issues
1. Check active connections: `SELECT * FROM pg_stat_activity;`
2. Identify slow queries: `SELECT * FROM pg_stat_statements ORDER BY total_time DESC;`
3. Run database maintenance: `VACUUM ANALYZE;`
4. Check indexes: `SELECT * FROM pg_stat_user_indexes WHERE idx_scan < 10;`

#### SSL Certificate Issues
1. Check certificate status: `sudo certbot certificates`
2. Test certificate: `openssl s_client -connect yourdomain.com:443`
3. Renew if needed: `sudo certbot renew --force-renewal`
4. Restart Nginx: `sudo systemctl restart nginx`

---

## Support and Updates

### Getting Help

- **Documentation**: Check this guide first
- **GitHub Issues**: Report bugs or request features
- **Email Support**: admin-panel-support@yourcompany.com
- **Emergency Contact**: +1-xxx-xxx-xxxx

### Update Process

1. **Backup**: Always backup before updates
2. **Staging**: Test updates in staging environment
3. **Dependencies**: Update dependencies first
4. **Application**: Update application code
5. **Database**: Run any required migrations
6. **Verification**: Test all functionality post-update

### Version Compatibility

- **Node.js**: 18.17.0+
- **PostgreSQL**: 14.0+
- **Next.js**: 14.0+
- **React**: 18.0+

---

*Last Updated: December 2024*
*Version: 1.0.0*