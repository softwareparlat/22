import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

// Sessions table for session storage
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }), // +595981234567
  role: varchar("role", { length: 50 }).notNull().default("client"), // 'admin', 'client', 'partner'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partners table
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  referralCode: varchar("referral_code", { length: 50 }).unique().notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull().default("25.00"),
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'negotiating', 'in_progress', 'completed', 'cancelled'
  progress: integer("progress").notNull().default(0), // 0-100
  clientId: integer("client_id").references(() => users.id).notNull(),
  partnerId: integer("partner_id").references(() => partners.id),
  startDate: timestamp("start_date"),
  deliveryDate: timestamp("delivery_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referrals table
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  projectId: integer("project_id").references(() => projects.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'converted', 'paid'
  commissionAmount: decimal("commission_amount", { precision: 12, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tickets table
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("open"), // 'open', 'in_progress', 'resolved', 'closed'
  priority: varchar("priority", { length: 50 }).notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  userId: integer("user_id").references(() => users.id).notNull(),
  projectId: integer("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'completed', 'failed'
  stage: varchar("stage", { length: 50 }).default("full"),
  stagePercentage: decimal("stage_percentage", { precision: 5, scale: 2 }).default("100.00"),
  paymentMethod: varchar("payment_method", { length: 100 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  mercadoPagoId: varchar("mercado_pago_id", { length: 255 }),
  paymentData: jsonb("payment_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Portfolio table
export const portfolio = pgTable("portfolio", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // 'E-commerce', 'Dashboard', 'Mobile App', etc.
  technologies: text("technologies").notNull(), // JSON string with tech stack
  imageUrl: text("image_url").notNull(),
  demoUrl: text("demo_url"),
  completedAt: timestamp("completed_at").notNull(),
  featured: boolean("featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment methods table
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'card', 'bank_transfer', 'mercadopago'
  provider: varchar("provider", { length: 100 }), // 'visa', 'mastercard', 'mercadopago'
  last4: varchar("last4", { length: 4 }),
  expiryDate: varchar("expiry_date", { length: 7 }), // MM/YYYY
  holderName: varchar("holder_name", { length: 255 }),
  bankName: varchar("bank_name", { length: 255 }),
  accountNumber: varchar("account_number", { length: 255 }),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"), // Para datos específicos del proveedor
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'paid', 'overdue', 'cancelled'
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  description: text("description"),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'payment', 'refund', 'fee'
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'completed', 'failed', 'cancelled'
  description: text("description").notNull(),
  transactionId: varchar("transaction_id", { length: 255 }), // ID de transacción externa
  providerData: jsonb("provider_data"), // Respuesta del proveedor de pagos
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment stages table for milestone payments
export const paymentStages = pgTable("payment_stages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  stageName: text("stage_name").notNull(),
  stagePercentage: integer("stage_percentage").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  requiredProgress: integer("required_progress").notNull().default(0),
  status: text("status").notNull().default("pending"), // pending, available, paid
  paymentLink: text("payment_link"),
  mercadoPagoId: text("mercado_pago_id"),
  paidAt: timestamp("paid_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull().default("info"), // 'info', 'success', 'warning', 'error'
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project messages table
export const projectMessages = pgTable("project_messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project files table
export const projectFiles = pgTable("project_files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Project timeline table
export const projectTimeline = pgTable("project_timeline", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending"),
  estimatedDate: timestamp("estimated_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ticket responses table
export const ticketResponses = pgTable("ticket_responses", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  isFromSupport: boolean("is_from_support").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Budget negotiations table
export const budgetNegotiations = pgTable("budget_negotiations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  proposedBy: integer("proposed_by").references(() => users.id).notNull(),
  originalPrice: decimal("original_price", { precision: 12, scale: 2 }).notNull(),
  proposedPrice: decimal("proposed_price", { precision: 12, scale: 2 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'accepted', 'rejected', 'countered'
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// MercadoPago configuration table
export const mercadoPagoConfig = pgTable("mercadopago_config", {
  id: serial("id").primaryKey(),
  accessToken: varchar("access_token", { length: 500 }),
  publicKey: varchar("public_key", { length: 500 }),
  clientId: varchar("client_id", { length: 100 }),
  clientSecret: varchar("client_secret", { length: 500 }),
  webhookSecret: varchar("webhook_secret", { length: 500 }),
  isProduction: boolean("is_production").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Twilio configuration table
export const twilioConfig = pgTable("twilio_config", {
  id: serial("id").primaryKey(),
  accountSid: varchar("account_sid", { length: 500 }),
  authToken: varchar("auth_token", { length: 500 }),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }),
  isProduction: boolean("is_production").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  partner: one(partners, {
    fields: [users.id],
    references: [partners.userId],
  }),
  projects: many(projects),
  tickets: many(tickets),
  referrals: many(referrals),
  notifications: many(notifications),
}));

export const partnersRelations = relations(partners, ({ one, many }) => ({
  user: one(users, {
    fields: [partners.userId],
    references: [users.id],
  }),
  projects: many(projects),
  referrals: many(referrals),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(users, {
    fields: [projects.clientId],
    references: [users.id],
  }),
  partner: one(partners, {
    fields: [projects.partnerId],
    references: [partners.id],
  }),
  payments: many(payments),
  paymentStages: many(paymentStages),
  tickets: many(tickets),
  referrals: many(referrals),
  projectMessages: many(projectMessages),
  projectTimeline: many(projectTimeline),
  projectFiles: many(projectFiles),
  budgetNegotiations: many(budgetNegotiations),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  partner: one(partners, {
    fields: [referrals.partnerId],
    references: [partners.id],
  }),
  client: one(users, {
    fields: [referrals.clientId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [referrals.projectId],
    references: [projects.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [tickets.projectId],
    references: [projects.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  project: one(projects, {
    fields: [payments.projectId],
    references: [projects.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
  client: one(users, {
    fields: [invoices.clientId],
    references: [users.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [invoices.paymentMethodId],
    references: [paymentMethods.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  invoice: one(invoices, {
    fields: [transactions.invoiceId],
    references: [invoices.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [transactions.paymentMethodId],
    references: [paymentMethods.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const paymentStagesRelations = relations(paymentStages, ({ one }) => ({
  project: one(projects, {
    fields: [paymentStages.projectId],
    references: [projects.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const projectMessagesRelations = relations(projectMessages, ({ one }) => ({
  project: one(projects, {
    fields: [projectMessages.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMessages.userId],
    references: [users.id],
  }),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, {
    fields: [projectFiles.projectId],
    references: [projects.id],
  }),
  uploadedBy: one(users, {
    fields: [projectFiles.uploadedBy],
    references: [users.id],
  }),
}));

export const projectTimelineRelations = relations(projectTimeline, ({ one }) => ({
  project: one(projects, {
    fields: [projectTimeline.projectId],
    references: [projects.id],
  }),
}));

export const ticketResponsesRelations = relations(ticketResponses, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketResponses.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketResponses.userId],
    references: [users.id],
  }),
}));

export const budgetNegotiationsRelations = relations(budgetNegotiations, ({ one }) => ({
  project: one(projects, {
    fields: [budgetNegotiations.projectId],
    references: [projects.id],
  }),
  proposedBy: one(users, {
    fields: [budgetNegotiations.proposedBy],
    references: [users.id],
  }),
}));

// Zod schemas
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  role: z.enum(["client", "partner"]),
});

export const contactSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  company: z.string().optional(),
  serviceType: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  acceptTerms: z.boolean().refine(val => val === true, "Debes aceptar los términos"),
});

// Additional schemas for forms
export const insertProjectSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  price: z.string().min(1, "El precio es requerido"),
  clientId: z.number(),
  partnerId: z.number().optional(),
  deliveryDate: z.string().optional(),
});

export const insertTicketSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  projectId: z.number().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type InsertProjectInput = z.infer<typeof insertProjectSchema>;
export type InsertTicketInput = z.infer<typeof insertTicketSchema>;

// Database types
export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;
export type Partner = InferSelectModel<typeof partners>;
export type InsertPartner = InferInsertModel<typeof partners>;
export type Project = InferSelectModel<typeof projects>;
export type InsertProject = InferInsertModel<typeof projects>;
export type Ticket = InferSelectModel<typeof tickets>;
export type InsertTicket = InferInsertModel<typeof tickets>;
export type Notification = InferSelectModel<typeof notifications>;
export type InsertNotification = InferInsertModel<typeof notifications>;
export type Referral = InferSelectModel<typeof referrals>;
export type InsertReferral = InferInsertModel<typeof referrals>;
export type Payment = InferSelectModel<typeof payments>;
export type InsertPayment = InferInsertModel<typeof payments>;
export type Portfolio = InferSelectModel<typeof portfolio>;
export type InsertPortfolio = InferInsertModel<typeof portfolio>;
export type ProjectMessage = InferSelectModel<typeof projectMessages>;
export type InsertProjectMessage = InferInsertModel<typeof projectMessages>;
export type ProjectFile = InferSelectModel<typeof projectFiles>;
export type InsertProjectFile = InferInsertModel<typeof projectFiles>;
export type ProjectTimeline = InferSelectModel<typeof projectTimeline>;
export type InsertProjectTimeline = InferInsertModel<typeof projectTimeline>;
export type TicketResponse = InferSelectModel<typeof ticketResponses>;
export type InsertTicketResponse = InferInsertModel<typeof ticketResponses>;
export type PaymentMethod = InferSelectModel<typeof paymentMethods>;
export type InsertPaymentMethod = InferInsertModel<typeof paymentMethods>;
export type Invoice = InferSelectModel<typeof invoices>;
export type InsertInvoice = InferInsertModel<typeof invoices>;
export type Transaction = InferSelectModel<typeof transactions>;
export type InsertTransaction = InferInsertModel<typeof transactions>;

// Budget negotiation types
export type BudgetNegotiation = InferSelectModel<typeof budgetNegotiations>;
export type InsertBudgetNegotiation = InferInsertModel<typeof budgetNegotiations>;

// MercadoPago configuration types
export type MercadoPagoConfig = InferSelectModel<typeof mercadoPagoConfig>;
export type InsertMercadoPagoConfig = InferInsertModel<typeof mercadoPagoConfig>;

// Twilio configuration types
export type TwilioConfig = InferSelectModel<typeof twilioConfig>;
export type InsertTwilioConfig = InferInsertModel<typeof twilioConfig>;