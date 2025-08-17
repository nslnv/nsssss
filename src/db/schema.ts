import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';

// Admin users table (simplified and updated)
export const adminUsers = sqliteTable('admin_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('admin'),
  createdAt: text('created_at').notNull(),
});

// Updated leads table with additional fields
export const leads = sqliteTable('leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  workType: text('work_type').notNull(),
  deadline: text('deadline'), // ISO date string
  budget: text('budget'),
  description: text('description').notNull(),
  source: text('source'),
  status: text('status').notNull().default('new'), // new|read|in_progress|closed|archived
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  statusIdx: index('idx_leads_status').on(table.status),
  createdAtIdx: index('idx_leads_created_at').on(table.createdAt),
  emailIdx: index('idx_leads_email').on(table.email),
  workTypeIdx: index('idx_leads_work_type').on(table.workType),
}));

// Updated lead files table
export const leadFiles = sqliteTable('lead_files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  leadId: integer('lead_id').notNull().references(() => leads.id),
  filename: text('filename').notNull(),
  storageKey: text('storage_key').notNull(),
  size: integer('size').notNull(),
  mimeType: text('mime_type').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  leadIdIdx: index('idx_lead_files_lead_id').on(table.leadId),
}));

// Updated audit logs table  
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  level: text('level').notNull(),
  message: text('message').notNull(),
  context: text('context', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  createdAtIdx: index('idx_audit_logs_created_at').on(table.createdAt),
  levelIdx: index('idx_audit_logs_level').on(table.level),
}));

// Keep site settings table unchanged
export const siteSettings = sqliteTable('site_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value', { mode: 'json' }),
  updatedAt: text('updated_at').notNull(),
});