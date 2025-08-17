# NSLNV Personal Portfolio & Admin System

Modern personal portfolio with comprehensive admin panel for lead management.

## 🚀 Features

### Public Website
- Dark theme portfolio with modern design
- Contact form with file uploads
- SEO optimized
- Mobile responsive
- Performance optimized

### Admin Panel
- **Authentication**: JWT-based login with HttpOnly cookies
- **Lead Management**: Complete CRUD operations with advanced filtering
- **Dashboard**: Analytics, metrics, and recent activity
- **File Handling**: Secure file uploads with virus scanning
- **Security**: Rate limiting, audit logging, CSRF protection
- **Export**: CSV/XLSX export functionality

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: SQLite (production ready)
- **Authentication**: JWT with HttpOnly cookies
- **File Storage**: Local filesystem (easily extendable to S3/R2)
- **State Management**: SWR for server state

## 📦 Installation

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Run seeders (creates admin user and sample data)
npm run seed

# Start development server
npm run dev
```

## 🔐 Admin Access

After running the seeder, access the admin panel:

- **URL**: `/admin`
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Change credentials in production!**

## 🗃 Database Schema

### Admin Users
```sql
admin_users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TEXT NOT NULL
)
```

### Leads
```sql
leads (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  work_type TEXT NOT NULL,
  deadline TEXT,
  budget TEXT,
  description TEXT NOT NULL,
  source TEXT,
  status TEXT DEFAULT 'new', -- new|read|in_progress|closed|archived
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

### Lead Files
```sql
lead_files (
  id INTEGER PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  filename TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TEXT NOT NULL
)
```

### Audit Logs
```sql
audit_logs (
  id INTEGER PRIMARY KEY,
  level TEXT NOT NULL, -- info|warn|error
  message TEXT NOT NULL,
  context TEXT, -- JSON data
  created_at TEXT NOT NULL
)
```

## 🔧 API Endpoints

### Public Endpoints
- `POST /api/leads` - Create new lead
- `POST /api/leads/upload` - Upload files

### Admin Endpoints (Protected)
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `GET /api/admin/leads` - List leads with filtering
- `GET /api/admin/leads/:id` - Get lead details
- `PATCH /api/admin/leads/:id` - Update lead
- `DELETE /api/admin/leads/:id` - Delete lead
- `POST /api/admin/leads` - Bulk operations (export, bulk delete)

## 🛡 Security Features

- **Authentication**: JWT tokens in HttpOnly cookies (7-day expiry)
- **Rate Limiting**: Public endpoints limited to prevent abuse
- **Input Validation**: Zod schemas for all inputs
- **File Security**: Type validation, size limits, path traversal protection
- **Audit Logging**: Complete audit trail of admin actions
- **CSRF Protection**: SameSite strict cookies
- **Spam Protection**: Honeypot fields and timing validation

## 🚀 Deployment

### Environment Variables
```bash
# Required for production
ADMIN_JWT_SECRET=your-super-secret-jwt-key-256-bits-minimum
DATABASE_URL=your-database-connection-string

# Optional: File storage (for S3/R2 integration)
STORAGE_BUCKET=your-storage-bucket
STORAGE_REGION=your-region
STORAGE_ACCESS_KEY_ID=your-access-key
STORAGE_SECRET_ACCESS_KEY=your-secret-key

# Optional: Notifications
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-chat-id
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Optional: Error tracking
SENTRY_DSN=your-sentry-dsn
```

### Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 Admin Panel Features

### Dashboard
- Key metrics widgets (New Today, In Progress, Closed, Archive)
- Lead analytics charts (time series, status distribution)
- Quick actions panel
- Recent leads table with inline status updates

### Lead Management
- Advanced filtering and search
- Multi-column sorting
- Bulk operations (status change, delete)
- Export to CSV/XLSX
- File management with secure downloads
- Complete audit trail

### Security & Monitoring
- Comprehensive audit logging
- Rate limiting with visual feedback
- Session management
- Input sanitization and validation

## 🔍 Monitoring & Logging

All admin actions are logged to the `audit_logs` table with context:
- Login/logout events
- Lead CRUD operations
- Bulk operations
- System errors
- Security events

Access logs via database studio or integrate with external monitoring tools.

## 🔄 Database Migrations

The system uses Drizzle ORM for database management:

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:push

# Open database studio
npm run db:studio
```

## 📱 Mobile Support

- Fully responsive admin interface
- Touch-optimized interactions
- Mobile-first design approach
- Offline capability for viewing data

## 🎯 Performance

- Server-side rendering with Next.js 15
- Optimistic UI updates
- SWR for intelligent caching
- Image optimization
- Code splitting and lazy loading

## 🚨 Important Notes

1. **Change default admin credentials** before production deployment
2. **Set strong JWT secret** (minimum 256 bits)
3. **Configure rate limiting** for your specific needs
4. **Set up backup strategy** for SQLite database
5. **Monitor audit logs** regularly for security

## 📞 Support

For questions or issues, contact the development team or check the audit logs in the admin panel for debugging information.

---

Built with ❤️ for efficient lead management and business growth.