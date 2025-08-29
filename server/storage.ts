import {
  users,
  partners,
  projects,
  referrals,
  tickets,
  payments,
  portfolio,
  notifications,
  projectMessages,
  projectFiles,
  projectTimeline,
  ticketResponses,
  paymentMethods,
  invoices,
  transactions,
  paymentStages,
  type User,
  type InsertUser,
  type Partner,
  type InsertPartner,
  type Project,
  type InsertProject,
  type Ticket,
  type InsertTicket,
  type Notification,
  type InsertNotification,
  type Referral,
  type InsertReferral,
  type Payment,
  type InsertPayment,
  type Portfolio,
  type InsertPortfolio,
  type ProjectMessage,
  type InsertProjectMessage,
  type ProjectFile,
  type InsertProjectFile,
  type ProjectTimeline,
  type InsertProjectTimeline,
  type TicketResponse, // Import TicketResponse type
  type InsertTicketResponse, // Import InsertTicketResponse type
  type PaymentMethod,
  type InsertPaymentMethod,
  type Invoice,
  type InsertInvoice,
  type Transaction,
  type InsertTransaction,
  budgetNegotiations, // Import budgetNegotiations schema
  type BudgetNegotiation, // Import BudgetNegotiation type
  type InsertBudgetNegotiation, // Import InsertBudgetNegotiation type
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, ne, and, gte, isNull, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

  // Partner operations
  getPartner(userId: number): Promise<Partner | undefined>;
  getPartnerByReferralCode(code: string): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, updates: Partial<Partner>): Promise<Partner>;
  getPartnerStats(partnerId: number): Promise<any>;
  getPartnerEarningsData(partnerId: number): Promise<any>;
  getPartnerCommissions(partnerId: number): Promise<any[]>;


  // Project operations
  getProjects(userId: number, role: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(projectId: number): Promise<void>;

  // Referral operations
  getReferrals(partnerId: number): Promise<any[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;

  // Ticket operations
  getTickets(userId: number): Promise<(Ticket & { responses?: (TicketResponse & { author: string; role: string })[]; })[]>;
  getTicket(ticketId: number): Promise<any | null>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket>;
  // Ticket response operations
  createTicketResponse(responseData: InsertTicketResponse): Promise<TicketResponse>;
  getTicketResponses(ticketId: number): Promise<(TicketResponse & { author: string; role: string })[]>;


  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  // Send notification to all admins
  notifyAdmins(notificationData: InsertNotification): Promise<void>;
  // Send notification to a specific user
  notifyUser(userId: number, notificationData: InsertNotification): Promise<void>;

  // Payment operations
  createPayment(insertPayment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<Payment>): Promise<Payment>;

  // Payment methods
  getPaymentMethodsByUser(userId: number): Promise<PaymentMethod[]>;
  createPaymentMethod(data: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, updates: Partial<InsertPaymentMethod>): Promise<PaymentMethod>;
  deletePaymentMethod(id: number): Promise<void>;

  // Invoices
  getInvoicesByClient(clientId: number): Promise<any[]>;
  createInvoice(data: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice>;

  // Transactions
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  createTransaction(data: InsertTransaction): Promise<Transaction>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<any[]>;
  getAdminStats(): Promise<any>;
  getAllProjectsForAdmin(): Promise<any[]>;
  deleteProject(projectId: number): Promise<void>;
  getProjectStats(): Promise<any>;
  getAllTicketsForAdmin(): Promise<any[]>;
  updateTicket(ticketId: number, updates: any): Promise<any>;
  deleteTicket(ticketId: number): Promise<void>;
  getTicketStats(): Promise<any>;
  getAllPartnersForAdmin(): Promise<any[]>;
  getPartnerStatsForAdmin(): Promise<any>;


  // Portfolio operations
  getPortfolio(): Promise<Portfolio[]>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, updates: Partial<Portfolio>): Promise<Portfolio>;
  deletePortfolio(id: number): Promise<void>;

  // Project management operations
  getProjectMessages(projectId: number): Promise<ProjectMessage[]>;
  createProjectMessage(message: InsertProjectMessage): Promise<ProjectMessage>;
  getProjectFiles(projectId: number): Promise<ProjectFile[]>;
  createProjectFile(file: InsertProjectFile): Promise<ProjectFile>;
  deleteProjectFile(id: number): Promise<void>;
  getProjectTimeline(projectId: number): Promise<ProjectTimeline[]>;
  createProjectTimeline(timeline: InsertProjectTimeline): Promise<ProjectTimeline>;
  updateProjectTimeline(timelineId: number, updates: any): Promise<ProjectTimeline>;
  hasProjectTimeline(projectId: number): Promise<boolean>;

  // Analytics Methods
  getAnalyticsData(period?: number): Promise<any>;
  getRevenueAnalytics(period?: number): Promise<any>;
  getUserAnalytics(period?: number): Promise<any>;
  getProjectAnalytics(period?: number): Promise<any>;
  getPartnerAnalytics(period?: number): Promise<any>;
  getKPIAnalytics(period?: number): Promise<any>;

  // Admin User Management
  getUserStatsForAdmin(): Promise<any>;

  // Seed data
  seedUsers(): Promise<void>;

  // Payment stages operations
  createPaymentStage(data: any): Promise<any>;
  getPaymentStages(projectId: number): Promise<any[]>;
  updatePaymentStage(stageId: number, updates: any): Promise<any>;
  completePaymentStage(stageId: number): Promise<any>;

  // Budget Negotiation Methods
  getBudgetNegotiations(projectId: number): Promise<BudgetNegotiation[]>;
  createBudgetNegotiation(negotiation: InsertBudgetNegotiation): Promise<BudgetNegotiation>;
  updateBudgetNegotiation(negotiationId: number, updates: Partial<BudgetNegotiation>): Promise<BudgetNegotiation>;
  getLatestBudgetNegotiation(projectId: number): Promise<BudgetNegotiation | null>;
}

export class DatabaseStorage implements IStorage {
  // Use the imported db instance directly
  // Removed db instance from here as it's already imported at the top level.

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getPartner(userId: number): Promise<Partner | undefined> {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.userId, userId));
    return partner;
  }

  async getPartnerByReferralCode(code: string): Promise<Partner | undefined> {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.referralCode, code));
    return partner;
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const [partner] = await db
      .insert(partners)
      .values(insertPartner)
      .returning();
    return partner;
  }

  async updatePartner(id: number, updates: Partial<Partner>): Promise<Partner> {
    const [partner] = await db
      .update(partners)
      .set(updates)
      .where(eq(partners.id, id))
      .returning();
    return partner;
  }

  async getPartnerStats(partnerId: number): Promise<any> {
    const [stats] = await db
      .select({
        totalEarnings: partners.totalEarnings,
        activeReferrals: sql<number>`COUNT(DISTINCT ${referrals.id})`,
        closedSales: sql<number>`COUNT(DISTINCT CASE WHEN ${referrals.status} = 'paid' THEN ${referrals.id} END)`
      })
      .from(partners)
      .leftJoin(referrals, eq(partners.id, referrals.partnerId))
      .where(eq(partners.id, partnerId))
      .groupBy(partners.id);

    return {
      totalEarnings: stats?.totalEarnings || "0.00",
      activeReferrals: stats?.activeReferrals || 0,
      closedSales: stats?.closedSales || 0,
      conversionRate: stats?.activeReferrals > 0
        ? Math.round((stats.closedSales / stats.activeReferrals) * 100)
        : 0,
    };
  }

  async getPartnerEarningsData(partnerId: number): Promise<any> {
    try {
      // Total earnings
      const totalEarnings = await db
        .select({ sum: sql`COALESCE(sum(commission_amount), 0)` })
        .from(referrals)
        .where(and(eq(referrals.partnerId, partnerId), eq(referrals.status, "paid")));

      // Monthly earnings (current month)
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const monthlyEarnings = await db
        .select({ sum: sql`COALESCE(sum(commission_amount), 0)` })
        .from(referrals)
        .where(and(
          eq(referrals.partnerId, partnerId),
          eq(referrals.status, "paid"),
          sql`created_at >= ${currentMonth}`
        ));

      // Pending commissions
      const pendingCommissions = await db
        .select({ sum: sql`COALESCE(sum(commission_amount), 0)` })
        .from(referrals)
        .where(and(eq(referrals.partnerId, partnerId), eq(referrals.status, "converted")));

      // Total referrals
      const totalReferrals = await db
        .select({ count: sql`count(*)` })
        .from(referrals)
        .where(eq(referrals.partnerId, partnerId));

      // Active referrals (with projects)
      const activeReferrals = await db
        .select({ count: sql`count(*)` })
        .from(referrals)
        .where(and(
          eq(referrals.partnerId, partnerId),
          sql`project_id IS NOT NULL`
        ));

      const conversionRate = totalReferrals[0]?.count > 0 ?
        (Number(activeReferrals[0]?.count || 0) / Number(totalReferrals[0]?.count) * 100) : 0;

      return {
        totalEarnings: Number(totalEarnings[0]?.sum || 0),
        monthlyEarnings: Number(monthlyEarnings[0]?.sum || 0),
        pendingCommissions: Number(pendingCommissions[0]?.sum || 0),
        paidCommissions: Number(totalEarnings[0]?.sum || 0),
        conversionRate: Math.round(conversionRate * 100) / 100,
        referralsCount: Number(totalReferrals[0]?.count || 0),
        activeReferrals: Number(activeReferrals[0]?.count || 0),
      };
    } catch (error) {
      console.error("Error getting partner earnings data:", error);
      throw error;
    }
  }

  async getPartnerCommissions(partnerId: number): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: referrals.id,
          projectName: projects.name,
          clientName: users.fullName,
          amount: referrals.commissionAmount,
          status: referrals.status,
          date: referrals.createdAt,
          paymentDate: sql`CASE WHEN ${referrals.status} = 'paid' THEN ${referrals.createdAt} ELSE NULL END`,
        })
        .from(referrals)
        .leftJoin(projects, eq(referrals.projectId, projects.id))
        .leftJoin(users, eq(referrals.clientId, users.id))
        .where(eq(referrals.partnerId, partnerId))
        .orderBy(desc(referrals.createdAt));

      return result.map(commission => ({
        ...commission,
        amount: Number(commission.amount || 0),
      }));
    } catch (error) {
      console.error("Error getting partner commissions:", error);
      throw error;
    }
  }

  async getProjects(userId: number, userRole: string): Promise<Project[]> {
    let query = db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        price: projects.price,
        status: projects.status,
        progress: projects.progress,
        clientId: projects.clientId,
        partnerId: projects.partnerId,
        startDate: projects.startDate,
        deliveryDate: projects.deliveryDate,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects);

    if (userRole !== "admin") {
      query = query.where(eq(projects.clientId, userId));
    }

    return await query.orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project> {
    try {
      console.log("Updating project with data:", updates);

      // Ensure dates are properly formatted
      const updateData: any = {
        ...updates,
        updatedAt: new Date(),
      };

      // Handle startDate conversion
      if (updates.startDate) {
        updateData.startDate = new Date(updates.startDate);
      }

      // Handle deliveryDate conversion
      if (updates.deliveryDate) {
        updateData.deliveryDate = new Date(updates.deliveryDate);
      }

      const [updatedProject] = await db
        .update(projects)
        .set(updateData)
        .where(eq(projects.id, id))
        .returning();

      // Si se actualiza el progreso, activar etapas correspondientes
      if (updates.progress !== undefined) {
        await this.updatePaymentStagesStatus(id, updates.progress);
      }

      return updatedProject;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  }

  async updatePaymentStagesStatus(projectId: number, currentProgress: number) {
    try {
      // Activar etapas que cumplan el progreso requerido
      await db
        .update(paymentStages)
        .set({ status: 'available' })
        .where(
          and(
            eq(paymentStages.projectId, projectId),
            lte(paymentStages.requiredProgress, currentProgress),
            eq(paymentStages.status, 'pending')
          )
        );
    } catch (error) {
      console.error("Error updating payment stages status:", error);
    }
  }


  async getReferrals(partnerId: number): Promise<any[]> {
    return await db
      .select({
        id: referrals.id,
        status: referrals.status,
        commissionAmount: referrals.commissionAmount,
        createdAt: referrals.createdAt,
        clientName: users.fullName,
        clientEmail: users.email,
        projectName: projects.name,
        projectPrice: projects.price,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.clientId, users.id))
      .leftJoin(projects, eq(referrals.projectId, projects.id))
      .where(eq(referrals.partnerId, partnerId))
      .orderBy(desc(referrals.createdAt));
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values(insertReferral)
      .returning();
    return referral;
  }

  async getTickets(userId: number): Promise<(Ticket & { responses?: (TicketResponse & { author: string; role: string })[]; })[]> {
    const ticketList = await db
      .select({
        id: tickets.id,
        title: tickets.title,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        projectName: projects.name,
        projectId: tickets.projectId,
      })
      .from(tickets)
      .leftJoin(projects, eq(tickets.projectId, projects.id))
      .where(eq(tickets.userId, userId))
      .orderBy(desc(tickets.createdAt));

    // Get responses for each ticket
    const ticketsWithResponses = await Promise.all(
      ticketList.map(async (ticket) => {
        const responses = await this.getTicketResponses(ticket.id);
        return {
          ...ticket,
          responses,
        };
      })
    );

    return ticketsWithResponses;
  }

  async getTicket(ticketId: number): Promise<any | null> {
    try {
      const result = await db
        .select({
          id: tickets.id,
          title: tickets.title,
          description: tickets.description,
          status: tickets.status,
          priority: tickets.priority,
          userId: tickets.userId,
          projectId: tickets.projectId,
          createdAt: tickets.createdAt,
          updatedAt: tickets.updatedAt,
        })
        .from(tickets)
        .where(eq(tickets.id, ticketId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error getting ticket:", error);
      throw error;
    }
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const [ticket] = await db
      .insert(tickets)
      .values(insertTicket)
      .returning();
    return ticket;
  }

  // This method is duplicated, keeping the one from the changes
  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket> {
    const [ticket] = await db
      .update(tickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  async createTicketResponse(responseData: InsertTicketResponse): Promise<TicketResponse> {
    const [response] = await db
      .insert(ticketResponses)
      .values({
        ...responseData,
        createdAt: new Date(), // Store as Date object
      })
      .returning();
    return response;
  }

  async getTicketResponses(ticketId: number): Promise<(TicketResponse & { author: string; role: string })[]> {
    return await db
      .select({
        id: ticketResponses.id,
        message: ticketResponses.message,
        author: users.fullName,
        role: users.role,
        createdAt: ticketResponses.createdAt,
        isFromSupport: ticketResponses.isFromSupport,
      })
      .from(ticketResponses)
      .leftJoin(users, eq(ticketResponses.userId, users.id))
      .where(eq(ticketResponses.ticketId, ticketId))
      .orderBy(ticketResponses.createdAt);
  }


  async getNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(20);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async notifyAdmins(notificationData: InsertNotification): Promise<void> {
    try {
      const admins = await this.getUsersByRole('admin');
      await Promise.all(admins.map(admin =>
        this.createNotification({ ...notificationData, userId: admin.id })
      ));
    } catch (error) {
      console.error("Error notifying admins:", error);
      throw error;
    }
  }

  async notifyUser(userId: number, notificationData: InsertNotification): Promise<void> {
    try {
      await this.createNotification({ ...notificationData, userId });
    } catch (error) {
      console.error(`Error notifying user ${userId}:`, error);
      throw error;
    }
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // Payment methods
  async getPaymentMethodsByUser(userId: number): Promise<PaymentMethod[]> {
    return await db
      .select()
      .from(paymentMethods)
      .where(and(
        eq(paymentMethods.userId, userId),
        eq(paymentMethods.isActive, true)
      ))
      .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.createdAt));
  }

  async createPaymentMethod(data: InsertPaymentMethod): Promise<PaymentMethod> {
    const [paymentMethod] = await db
      .insert(paymentMethods)
      .values(data)
      .returning();
    return paymentMethod;
  }

  async updatePaymentMethod(id: number, updates: Partial<InsertPaymentMethod>): Promise<PaymentMethod> {
    const [paymentMethod] = await db
      .update(paymentMethods)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(paymentMethods.id, id))
      .returning();
    return paymentMethod;
  }

  async deletePaymentMethod(id: number): Promise<void> {
    await db
      .update(paymentMethods)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(paymentMethods.id, id));
  }

  // Invoices
  async getInvoicesByClient(clientId: number): Promise<any[]> {
    return await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        projectId: invoices.projectId,
        amount: invoices.amount,
        status: invoices.status,
        dueDate: invoices.dueDate,
        paidDate: invoices.paidDate,
        description: invoices.description,
        totalAmount: invoices.totalAmount,
        createdAt: invoices.createdAt,
        projectName: projects.name,
      })
      .from(invoices)
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .where(eq(invoices.clientId, clientId))
      .orderBy(desc(invoices.createdAt));
  }

  async createInvoice(data: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values(data)
      .returning();
    return invoice;
  }

  async updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  // Transactions
  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(data)
      .returning();
    return transaction;
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async getUsersByRole(role: string): Promise<any[]> {
    try {
      return await db.select().from(users).where(eq(users.role, role));
    } catch (error) {
      console.error("Error getting users by role:", error);
      throw error;
    }
  }

  // Portfolio operations (Implemented)
  async getPortfolio(): Promise<Portfolio[]> {
    try {
      const result = await db.select().from(portfolio).where(eq(portfolio.isActive, true)).orderBy(desc(portfolio.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      // Return empty array instead of throwing to prevent 500 errors
      return [];
    }
  }

  async createPortfolio(data: InsertPortfolio): Promise<Portfolio> {
    try {
      // Convert string date to Date object if needed
      const portfolioData = {
        ...data,
        completedAt: typeof data.completedAt === 'string' ? new Date(data.completedAt) : data.completedAt
      };

      const [newPortfolio] = await db.insert(portfolio).values(portfolioData).returning();
      return newPortfolio;
    } catch (error) {
      console.error("Error creating portfolio:", error);
      throw error;
    }
  }

  async updatePortfolio(id: number, updates: Partial<Portfolio>): Promise<Portfolio> {
    try {
      // Convert string date to Date object if needed
      const portfolioUpdates = {
        ...updates,
        completedAt: updates.completedAt && typeof updates.completedAt === 'string'
          ? new Date(updates.completedAt)
          : updates.completedAt,
        updatedAt: new Date()
      };

      const [updatedPortfolio] = await db
        .update(portfolio)
        .set(portfolioUpdates)
        .where(eq(portfolio.id, id))
        .returning();
      return updatedPortfolio;
    } catch (error) {
      console.error("Error updating portfolio:", error);
      throw error;
    }
  }

  async deletePortfolio(id: number): Promise<void> {
    try {
      await db.delete(portfolio).where(eq(portfolio.id, id));
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      throw error;
    }
  }

  // Admin Stats
  async getAdminStats(): Promise<any> {
    try {
      const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
      const activePartners = await db.select({ count: sql`count(*)` }).from(partners);
      const totalProjects = await db.select({ count: sql`count(*)` }).from(projects);

      // Calculate real revenue from paid payment stages
      const totalRevenue = await db
        .select({ sum: sql`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` })
        .from(paymentStages)
        .where(eq(paymentStages.status, 'paid'));

      // Calculate monthly revenue (current month)
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

      const monthlyRevenue = await db
        .select({ sum: sql`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` })
        .from(paymentStages)
        .where(and(
          eq(paymentStages.status, 'paid'),
          sql`updated_at >= ${firstDayOfMonth.toISOString()}`
        ));

      return {
        totalUsers: totalUsers[0]?.count?.toString() || "0",
        activePartners: activePartners[0]?.count?.toString() || "0",
        totalProjects: totalProjects[0]?.count?.toString() || "0",
        totalRevenue: Number(totalRevenue[0]?.sum || 0).toFixed(2),
        monthlyRevenue: Number(monthlyRevenue[0]?.sum || 0).toFixed(2),
      };
    } catch (error) {
      console.error("Error getting admin stats:", error);
      throw error;
    }
  }

  async getAllProjectsForAdmin(): Promise<any[]> {
    return await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        price: projects.price,
        status: projects.status,
        progress: projects.progress,
        startDate: projects.startDate,
        deliveryDate: projects.deliveryDate,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        clientId: projects.clientId,
        clientName: users.fullName,
        clientEmail: users.email,
      })
      .from(projects)
      .leftJoin(users, eq(projects.clientId, users.id))
      .orderBy(desc(projects.createdAt));
  }

  async deleteProject(projectId: number): Promise<void> {
    try {
      // First delete related records in the correct order to avoid foreign key constraints

      // Delete ticket responses for tickets related to this project
      await db.delete(ticketResponses).where(
        sql`ticket_id IN (SELECT id FROM tickets WHERE project_id = ${projectId})`
      );

      // Delete tickets related to this project
      await db.delete(tickets).where(eq(tickets.projectId, projectId));

      // Delete budget negotiations related to this project
      await db.delete(budgetNegotiations).where(eq(budgetNegotiations.projectId, projectId));

      // Delete project timeline
      await db.delete(projectTimeline).where(eq(projectTimeline.projectId, projectId));

      // Delete project messages
      await db.delete(projectMessages).where(eq(projectMessages.projectId, projectId));

      // Delete project files
      await db.delete(projectFiles).where(eq(projectFiles.projectId, projectId));

      // Delete referrals related to this project
      await db.delete(referrals).where(eq(referrals.projectId, projectId));

      // Delete transactions related to invoices of this project (before deleting invoices)
      await db.delete(transactions).where(
        sql`invoice_id IN (SELECT id FROM invoices WHERE project_id = ${projectId})`
      );

      // Delete invoices related to this project
      await db.delete(invoices).where(eq(invoices.projectId, projectId));

      // Delete payments related to this project (if the column exists)
      try {
        await db.delete(payments).where(eq(payments.projectId, projectId));
      } catch (error) {
        // Ignore if projectId column doesn't exist in payments table
        console.log("Note: payments table may not have projectId column");
      }

      // Delete payment stages related to this project
      await db.delete(paymentStages).where(eq(paymentStages.projectId, projectId));

      // Finally delete the project
      await db.delete(projects).where(eq(projects.id, projectId));

    } catch (error) {
      console.error("Error deleting project:", error);
      throw new Error(`Error al eliminar el proyecto: ${error.message}`);
    }
  }

  async getProjectStats(): Promise<any> {
    try {
      const stats = await db
        .select({
          status: projects.status,
          count: sql`count(*)`,
        })
        .from(projects)
        .groupBy(projects.status);

      // Calculate real revenue from paid payment stages instead of project prices
      const realRevenue = await db
        .select({ sum: sql`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` })
        .from(paymentStages)
        .where(eq(paymentStages.status, 'paid'));

      // Also get potential revenue (all project prices)
      const potentialRevenue = await db
        .select({ sum: sql`COALESCE(SUM(CAST(price AS DECIMAL)), 0)` })
        .from(projects);

      const result = {
        pending: "0",
        inProgress: "0",
        completed: "0",
        cancelled: "0",
        totalRevenue: Number(realRevenue[0]?.sum || 0).toFixed(2),
        potentialRevenue: Number(potentialRevenue[0]?.sum || 0).toFixed(2),
      };

      stats.forEach((stat) => {
        const status = stat.status as keyof typeof result;
        if (status !== 'totalRevenue' && status !== 'potentialRevenue') {
          result[status] = stat.count?.toString() || "0";
        }
      });

      return result;
    } catch (error) {
      console.error("Error getting project stats:", error);
      throw error;
    }
  }

  // Project management operations
  async getProjectMessages(projectId: number): Promise<ProjectMessage[]> {
    return await db
      .select({
        id: projectMessages.id,
        projectId: projectMessages.projectId,
        userId: projectMessages.userId,
        message: projectMessages.message,
        createdAt: projectMessages.createdAt,
        author: users.fullName,
        role: users.role,
      })
      .from(projectMessages)
      .leftJoin(users, eq(projectMessages.userId, users.id))
      .where(eq(projectMessages.projectId, projectId))
      .orderBy(desc(projectMessages.createdAt));
  }

  async createProjectMessage(message: InsertProjectMessage): Promise<ProjectMessage> {
    const [newMessage] = await db
      .insert(projectMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getProjectFiles(projectId: number): Promise<ProjectFile[]> {
    return await db
      .select({
        id: projectFiles.id,
        projectId: projectFiles.projectId,
        fileName: projectFiles.fileName,
        fileUrl: projectFiles.fileUrl,
        fileType: projectFiles.fileType,
        uploadedBy: projectFiles.uploadedBy,
        uploadedAt: projectFiles.uploadedAt,
        uploaderName: users.fullName,
      })
      .from(projectFiles)
      .leftJoin(users, eq(projectFiles.uploadedBy, users.id))
      .where(eq(projectFiles.projectId, projectId))
      .orderBy(desc(projectFiles.uploadedAt));
  }

  async createProjectFile(file: InsertProjectFile): Promise<ProjectFile> {
    const [newFile] = await db
      .insert(projectFiles)
      .values(file)
      .returning();
    return newFile;
  }

  async deleteProjectFile(id: number): Promise<void> {
    await db.delete(projectFiles).where(eq(projectFiles.id, id));
  }

  async getProjectTimeline(projectId: number): Promise<ProjectTimeline[]> {
    return await db
      .select()
      .from(projectTimeline)
      .where(eq(projectTimeline.projectId, projectId))
      .orderBy(projectTimeline.createdAt);
  }

  async createProjectTimeline(timeline: InsertProjectTimeline): Promise<ProjectTimeline> {
    try {
      const timelineData: any = { ...timeline };

      // Convert string dates to Date objects, handle null values properly
      if (timeline.estimatedDate !== undefined && timeline.estimatedDate !== null) {
        if (typeof timeline.estimatedDate === 'string') {
          const estimatedDate = new Date(timeline.estimatedDate);
          if (isNaN(estimatedDate.getTime())) {
            throw new Error("Fecha estimada inválida");
          }
          timelineData.estimatedDate = estimatedDate;
        }
      } else if (timeline.estimatedDate === null) {
        timelineData.estimatedDate = null;
      }

      if (timeline.completedAt !== undefined && timeline.completedAt !== null) {
        if (typeof timeline.completedAt === 'string') {
          const completedAt = new Date(timeline.completedAt);
          if (isNaN(completedAt.getTime())) {
            throw new Error("Fecha de completado inválida");
          }
          timelineData.completedAt = completedAt;
        }
      } else if (timeline.completedAt === null) {
        timelineData.completedAt = null;
      }

      const [newTimeline] = await db
        .insert(projectTimeline)
        .values(timelineData)
        .returning();
      return newTimeline;
    } catch (error) {
      console.error("Error creating project timeline:", error);
      throw error;
    }
  }

  async updateProjectTimeline(timelineId: number, updates: any): Promise<ProjectTimeline> {
    try {
      const updateData: any = { ...updates };

      // Handle completedAt date conversion if present
      if (updates.completedAt !== undefined) {
        if (updates.completedAt === null) {
          updateData.completedAt = null;
        } else if (typeof updates.completedAt === 'string') {
          const completedDate = new Date(updates.completedAt);
          if (isNaN(completedDate.getTime())) {
            throw new Error("Fecha de completado inválida");
          }
          updateData.completedAt = completedDate;
        }
      }

      // Si se está marcando como completado, agregar fecha
      if (updates.status === 'completed' && !updateData.completedAt) {
        updateData.completedAt = new Date();
      }

      const [timeline] = await db
        .update(projectTimeline)
        .set(updateData)
        .where(eq(projectTimeline.id, timelineId))
        .returning();

      if (!timeline) {
        throw new Error("Timeline no encontrado");
      }

      // Si se completó un elemento del timeline, actualizar el progreso del proyecto
      if (updates.status === 'completed') {
        await this.updateProjectProgressBasedOnTimeline(timeline.projectId);
      }

      return timeline;
    } catch (error) {
      console.error("Error updating project timeline:", error);
      throw error;
    }
  }

  // Método para verificar si ya existe timeline para un proyecto
  async hasProjectTimeline(projectId: number): Promise<boolean> {
    const timeline = await db
      .select()
      .from(projectTimeline)
      .where(eq(projectTimeline.projectId, projectId))
      .limit(1);

    return timeline.length > 0;
  }

  // Nuevo método para actualizar progreso basado en timeline completado
  async updateProjectProgressBasedOnTimeline(projectId: number): Promise<void> {
    try {
      // Obtener todos los elementos del timeline
      const allTimeline = await db
        .select()
        .from(projectTimeline)
        .where(eq(projectTimeline.projectId, projectId));

      if (allTimeline.length === 0) return;

      // Calcular progreso basado en elementos completados
      const completedCount = allTimeline.filter(item => item.status === 'completed').length;
      const totalCount = allTimeline.length;
      const progressPercentage = Math.round((completedCount / totalCount) * 100);

      console.log(`📊 Actualizando progreso del proyecto ${projectId}: ${completedCount}/${totalCount} = ${progressPercentage}%`);

      // Actualizar el progreso del proyecto
      await this.updateProject(projectId, { progress: progressPercentage });

    } catch (error) {
      console.error("Error updating project progress based on timeline:", error);
    }
  }

  // Budget Negotiations
  async getBudgetNegotiations(projectId: number): Promise<BudgetNegotiation[]> {
    return db
      .select({
        id: budgetNegotiations.id,
        projectId: budgetNegotiations.projectId,
        proposedBy: budgetNegotiations.proposedBy,
        originalPrice: budgetNegotiations.originalPrice,
        proposedPrice: budgetNegotiations.proposedPrice,
        message: budgetNegotiations.message,
        status: budgetNegotiations.status,
        createdAt: budgetNegotiations.createdAt,
        respondedAt: budgetNegotiations.respondedAt,
        proposerName: users.fullName,
        proposerRole: users.role,
      })
      .from(budgetNegotiations)
      .leftJoin(users, eq(budgetNegotiations.proposedBy, users.id))
      .where(eq(budgetNegotiations.projectId, projectId))
      .orderBy(desc(budgetNegotiations.createdAt));
  }

  async createBudgetNegotiation(negotiation: InsertBudgetNegotiation): Promise<BudgetNegotiation> {
    const [created] = await db
      .insert(budgetNegotiations)
      .values(negotiation)
      .returning();

    if (!created) {
      throw new Error("Error al crear negociación de presupuesto");
    }

    return created;
  }

  async updateBudgetNegotiation(negotiationId: number, updates: Partial<BudgetNegotiation>): Promise<BudgetNegotiation> {
    const [updated] = await db
      .update(budgetNegotiations)
      .set({
        ...updates,
        respondedAt: updates.status ? new Date() : undefined,
      })
      .where(eq(budgetNegotiations.id, negotiationId))
      .returning();

    if (!updated) {
      throw new Error("Negociación no encontrada");
    }

    return updated;
  }

  async getLatestBudgetNegotiation(projectId: number): Promise<BudgetNegotiation | null> {
    const [latest] = await db
      .select()
      .from(budgetNegotiations)
      .where(eq(budgetNegotiations.projectId, projectId))
      .orderBy(desc(budgetNegotiations.createdAt))
      .limit(1);

    return latest || null;
  }


  // Admin Ticket Functions
  async getAllTicketsForAdmin(): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: tickets.id,
          title: tickets.title,
          description: tickets.description,
          status: tickets.status,
          priority: tickets.priority,
          createdAt: tickets.createdAt,
          updatedAt: tickets.updatedAt,
          projectId: tickets.projectId,
          clientId: tickets.userId,
          clientName: users.fullName,
          clientEmail: users.email,
          projectName: projects.name,
          responseCount: sql`COALESCE((SELECT COUNT(*) FROM ticket_responses WHERE ticket_id = ${tickets.id}), 0)`,
          lastResponseAt: sql`(SELECT MAX(created_at) FROM ticket_responses WHERE ticket_id = ${tickets.id})`,
        })
        .from(tickets)
        .leftJoin(users, eq(tickets.userId, users.id))
        .leftJoin(projects, eq(tickets.projectId, projects.id))
        .orderBy(desc(tickets.createdAt));

      return result;
    } catch (error) {
      console.error("Error getting all tickets for admin:", error);
      throw error;
    }
  }

  async updateTicket(ticketId: number, updates: any): Promise<any> {
    try {
      const result = await db
        .update(tickets)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(tickets.id, ticketId))
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error updating ticket:", error);
      throw error;
    }
  }

  async deleteTicket(ticketId: number): Promise<void> {
    try {
      // First delete all responses
      await db
        .delete(ticketResponses)
        .where(eq(ticketResponses.ticketId, ticketId));

      // Then delete the ticket
      await db
        .delete(tickets)
        .where(eq(tickets.id, ticketId));
    } catch (error) {
      console.error("Error deleting ticket:", error);
      throw error;
    }
  }

  async getTicketStats(): Promise<any> {
    try {
      const totalTickets = await db
        .select({ count: sql`count(*)` })
        .from(tickets);

      const openTickets = await db
        .select({ count: sql`count(*)` })
        .from(tickets)
        .where(eq(tickets.status, 'open'));

      const inProgressTickets = await db
        .select({ count: sql`count(*)` })
        .from(tickets)
        .where(eq(tickets.status, 'in_progress'));

      const resolvedTickets = await db
        .select({ count: sql`count(*)` })
        .from(tickets)
        .where(eq(tickets.status, 'resolved'));

      // Calculate average response time (mock data for now)
      const avgResponseTime = 2.5; // hours
      const avgResolutionTime = 24; // hours
      const customerSatisfaction = 92; // percentage

      return {
        totalTickets: totalTickets[0]?.count || 0,
        openTickets: openTickets[0]?.count || 0,
        inProgressTickets: inProgressTickets[0]?.count || 0,
        resolvedTickets: resolvedTickets[0]?.count || 0,
        avgResponseTime,
        avgResolutionTime,
        customerSatisfaction,
      };
    } catch (error) {
      console.error("Error getting ticket stats:", error);
      throw error;
    }
  }

  // Admin Partner Management
  async getAllPartnersForAdmin(): Promise<any[]> {
    try {
      const partnersData = await db
        .select({
          id: partners.id,
          userId: partners.userId,
          referralCode: partners.referralCode,
          commissionRate: partners.commissionRate,
          totalEarnings: partners.totalEarnings,
          createdAt: partners.createdAt,
          userFullName: users.fullName,
          userEmail: users.email,
          userIsActive: users.isActive,
        })
        .from(partners)
        .leftJoin(users, eq(partners.userId, users.id));

      return partnersData.map(partner => ({
        id: partner.id,
        userId: partner.userId,
        referralCode: partner.referralCode,
        commissionRate: partner.commissionRate,
        totalEarnings: partner.totalEarnings,
        createdAt: partner.createdAt,
        user: {
          id: partner.userId,
          fullName: partner.userFullName,
          email: partner.userEmail,
          isActive: partner.userIsActive,
        },
        stats: {
          activeReferrals: Math.floor(Math.random() * 10) + 1,
          closedSales: Math.floor(Math.random() * 5) + 1,
          conversionRate: Math.floor(Math.random() * 50) + 25,
          monthlyEarnings: (Math.random() * 1000).toFixed(2),
        },
      }));
    } catch (error) {
      console.error("Error getting all partners for admin:", error);
      throw error;
    }
  }


  async getPartnerStatsForAdmin(): Promise<any> {
    try {
      const totalPartners = await db
        .select({ count: sql`count(*)` })
        .from(partners);

      const activePartners = await db
        .select({ count: sql`count(*)` })
        .from(partners)
        .leftJoin(users, eq(partners.userId, users.id))
        .where(eq(users.isActive, true));

      const totalCommissions = await db
        .select({ total: sql<number>`coalesce(sum(${partners.totalEarnings}::numeric), 0)` })
        .from(partners);

      return {
        totalPartners: totalPartners[0]?.count || 0,
        activePartners: activePartners[0]?.count || 0,
        totalCommissionsPaid: totalCommissions[0]?.total || 0,
        averageConversionRate: 45, // Mock data
        topPerformers: 3, // Mock data
      };
    } catch (error) {
      console.error("Error getting partner stats for admin:", error);
      throw error;
    }
  }

  // Analytics Methods
  async getAnalyticsData(period: number = 30): Promise<any> {
    try {
      const [revenueData, userData, projectData, partnerData, kpis] = await Promise.all([
        this.getRevenueAnalytics(period),
        this.getUserAnalytics(period),
        this.getProjectAnalytics(period),
        this.getPartnerAnalytics(period),
        this.getKPIAnalytics(period),
      ]);

      return {
        revenue: revenueData,
        users: userData,
        projects: projectData,
        partners: partnerData,
        kpis: kpis,
      };
    } catch (error) {
      console.error("Error getting analytics data:", error);
      throw error;
    }
  }

  async getRevenueAnalytics(period: number = 30): Promise<any> {
    try {
      const totalRevenue = await db
        .select({ total: sql<number>`coalesce(sum(${projects.price}::numeric), 0)` })
        .from(projects)
        .where(eq(projects.status, 'completed'));

      const monthlyRevenue = await db
        .select({
          month: sql<string>`to_char(${projects.createdAt}, 'Mon')`,
          revenue: sql<number>`coalesce(sum(${projects.price}::numeric), 0)`,
          projects: sql<number>`count(*)`
        })
        .from(projects)
        .where(eq(projects.status, 'completed'))
        .groupBy(sql`extract(month from ${projects.createdAt}), to_char(${projects.createdAt}, 'Mon')`)
        .orderBy(sql`extract(month from ${projects.createdAt})`);

      return {
        total: totalRevenue[0]?.total || 0,
        monthly: 12500, // Mock data
        growth: 15.3, // Mock data
        chart: monthlyRevenue.length > 0 ? monthlyRevenue : [
          { month: "Ene", revenue: 8500, projects: 3 },
          { month: "Feb", revenue: 9200, projects: 4 },
          { month: "Mar", revenue: 11300, projects: 5 },
          { month: "Abr", revenue: 12500, projects: 6 },
          { month: "May", revenue: 14750, projects: 7 },
          { month: "Jun", revenue: 16200, projects: 8 },
        ],
      };
    } catch (error) {
      console.error("Error getting revenue analytics:", error);
      throw error;
    }
  }

  async getUserAnalytics(period: number = 30): Promise<any> {
    try {
      const totalUsers = await db
        .select({ count: sql`count(*)` })
        .from(users);

      const activeUsers = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(eq(users.isActive, true));

      const monthlyUsers = await db
        .select({
          month: sql<string>`to_char(${users.createdAt}, 'Mon')`,
          users: sql<number>`count(*)`,
          active: sql<number>`count(case when ${users.isActive} then 1 end)`
        })
        .from(users)
        .groupBy(sql`extract(month from ${users.createdAt}), to_char(${users.createdAt}, 'Mon')`)
        .orderBy(sql`extract(month from ${users.createdAt})`);

      return {
        total: totalUsers[0]?.count || 0,
        active: activeUsers[0]?.count || 0,
        growth: 12.8, // Mock data
        chart: monthlyUsers.length > 0 ? monthlyUsers : [
          { month: "Ene", users: 120, active: 65 },
          { month: "Feb", users: 128, active: 72 },
          { month: "Mar", users: 135, active: 78 },
          { month: "Abr", users: 142, active: 82 },
          { month: "May", users: 149, active: 86 },
          { month: "Jun", users: 156, active: 89 },
        ],
      };
    } catch (error) {
      console.error("Error getting user analytics:", error);
      throw error;
    }
  }

  async getProjectAnalytics(period: number = 30): Promise<any> {
    try {
      const totalProjects = await db
        .select({ count: sql`count(*)` })
        .from(projects);

      const completedProjects = await db
        .select({ count: sql`count(*)` })
        .from(projects)
        .where(eq(projects.status, 'completed'));

      const projectsByStatus = await db
        .select({
          status: projects.status,
          count: sql<number>`count(*)`
        })
        .from(projects)
        .groupBy(projects.status);

      const statusChart = projectsByStatus.map(item => ({
        status: item.status === 'completed' ? 'Completados' :
          item.status === 'in_progress' ? 'En Desarrollo' : 'Pendientes',
        count: item.count,
        color: item.status === 'completed' ? '#22c55e' :
          item.status === 'in_progress' ? '#3b82f6' : '#f59e0b'
      }));

      const total = totalProjects[0]?.count || 0;
      const completed = completedProjects[0]?.count || 0;

      return {
        total,
        completed,
        success_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        chart: statusChart.length > 0 ? statusChart : [
          { status: "Completados", count: 35, color: "#22c55e" },
          { status: "En Desarrollo", count: 5, color: "#3b82f6" },
          { status: "Pendientes", count: 2, color: "#f59e0b" },
        ],
      };
    } catch (error) {
      console.error("Error getting project analytics:", error);
      throw error;
    }
  }

  async getPartnerAnalytics(period: number = 30): Promise<any> {
    try {
      const totalPartners = await db
        .select({ count: sql`count(*)` })
        .from(partners);

      const activePartners = await db
        .select({ count: sql`count(*)` })
        .from(partners)
        .leftJoin(users, eq(partners.userId, users.id))
        .where(eq(users.isActive, true));

      const topPartners = await db
        .select({
          partner: users.fullName,
          earnings: partners.totalEarnings,
          referrals: sql<number>`5` // Mock data
        })
        .from(partners)
        .leftJoin(users, eq(partners.userId, users.id))
        .orderBy(sql`${partners.totalEarnings}::numeric desc`)
        .limit(5);

      return {
        total: totalPartners[0]?.count || 0,
        active: activePartners[0]?.count || 0,
        conversion: 45.2, // Mock data
        earnings: topPartners.length > 0 ? topPartners.map(p => ({
          partner: p.partner,
          earnings: parseFloat(p.earnings),
          referrals: p.referrals
        })) : [
            { partner: "Partner A", earnings: 2250, referrals: 8 },
            { partner: "Partner B", earnings: 1875, referrals: 6 },
            { partner: "Partner C", earnings: 1640, referrals: 5 },
          ],
      };
    } catch (error) {
      console.error("Error getting partner analytics:", error);
      throw error;
    }
  }

  async getKPIAnalytics(period: number = 30): Promise<any> {
    try {
      const avgProjectValue = await db
        .select({ avg: sql<number>`coalesce(avg(${projects.price}::numeric), 0)` })
        .from(projects)
        .where(eq(projects.status, 'completed'));

      return {
        customer_lifetime_value: 2850, // Mock data
        churn_rate: 5.2, // Mock data
        satisfaction_score: 4.6, // Mock data
        avg_project_value: Math.round(avgProjectValue[0]?.avg || 1890),
      };
    } catch (error) {
      console.error("Error getting KPI analytics:", error);
      throw error;
    }
  }

  // Admin User Management
  async getUserStatsForAdmin(): Promise<any> {
    try {
      const totalUsers = await db
        .select({ count: sql`count(*)` })
        .from(users);

      const activeUsers = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(eq(users.isActive, true));

      const adminUsers = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(eq(users.role, 'admin'));

      const clientUsers = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(eq(users.role, 'client'));

      const partnerUsers = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(eq(users.role, 'partner'));

      return {
        totalUsers: totalUsers[0]?.count || 0,
        activeUsers: activeUsers[0]?.count || 0,
        inactiveUsers: (totalUsers[0]?.count || 0) - (activeUsers[0]?.count || 0),
        adminUsers: adminUsers[0]?.count || 0,
        clientUsers: clientUsers[0]?.count || 0,
        partnerUsers: partnerUsers[0]?.count || 0,
        newUsersThisMonth: 5, // Mock data - could implement actual calculation
      };
    } catch (error) {
      console.error("Error getting user stats for admin:", error);
      throw error;
    }
  }

  async seedUsers(): Promise<void> {
    const bcrypt = await import("bcryptjs");

    const seedUsers = [
      {
        email: "admin@softwarepar.lat",
        password: await bcrypt.hash("admin123", 10),
        fullName: "Administrador SoftwarePar",
        role: "admin" as const,
      },
      {
        email: "cliente@test.com",
        password: await bcrypt.hash("cliente123", 10),
        fullName: "Cliente Test",
        role: "client" as const,
      },
      {
        email: "partner@test.com",
        password: await bcrypt.hash("partner123", 10),
        fullName: "Partner Test",
        role: "partner" as const,
      },
    ];

    for (const userData of seedUsers) {
      const existingUser = await this.getUserByEmail(userData.email);
      if (!existingUser) {
        const user = await this.createUser(userData);

        // Create partner for partner user
        if (userData.role === "partner") {
          await this.createPartner({
            userId: user.id,
            referralCode: "ABC123",
            commissionRate: "25.00",
            totalEarnings: "0.00",
          });
        }
      }
    }
  }

  // Payment stages functions
  async createPaymentStage(data: any): Promise<any> {
    try {
      const [stage] = await db
        .insert(paymentStages)
        .values({
          projectId: data.projectId,
          stageName: data.stageName,
          stagePercentage: data.stagePercentage.toString(),
          amount: data.amount.toString(),
          requiredProgress: data.requiredProgress,
          status: data.status || 'pending'
        })
        .returning();
      return stage;
    } catch (error) {
      console.error("Error creating payment stage:", error);
      throw error;
    }
  }

  async getPaymentStages(projectId: number): Promise<any[]> {
    try {
      const stages = await db
        .select()
        .from(paymentStages)
        .where(eq(paymentStages.projectId, projectId))
        .orderBy(paymentStages.requiredProgress);
      return stages;
    } catch (error) {
      console.error("Error getting payment stages:", error);
      throw error;
    }
  }

  async updatePaymentStage(stageId: number, updates: any): Promise<any> {
    try {
      const [updated] = await db
        .update(paymentStages)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(paymentStages.id, stageId))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating payment stage:", error);
      throw error;
    }
  }

  async completePaymentStage(stageId: number): Promise<any> {
    try {
      const [updated] = await db
        .update(paymentStages)
        .set({
          status: 'paid',
          paidAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(paymentStages.id, stageId))
        .returning();

      return updated;
    } catch (error) {
      console.error("Error completing payment stage:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();