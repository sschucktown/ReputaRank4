import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { 
  type User, type InsertUser,
  type Client, type InsertClient,
  type ReviewRequest, type InsertReviewRequest,
  type Testimonial, type InsertTestimonial,
  users, clients, reviewRequests, testimonials
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Clients
  getClients(userId: string): Promise<Client[]>;
  getClient(id: string, userId: string): Promise<Client | undefined>;
  createClient(client: InsertClient, userId: string): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>, userId: string): Promise<Client | undefined>;
  deleteClient(id: string, userId: string): Promise<boolean>;

  // Review Requests
  getReviewRequests(userId: string): Promise<ReviewRequest[]>;
  getReviewRequest(id: string, userId: string): Promise<ReviewRequest | undefined>;
  createReviewRequest(request: InsertReviewRequest, userId: string): Promise<ReviewRequest>;
  updateReviewRequestStatus(id: string, status: string, userId: string): Promise<ReviewRequest | undefined>;

  // Testimonials
  getTestimonials(userId: string): Promise<Testimonial[]>;
  getTestimonial(id: string, userId: string): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial, userId: string): Promise<Testimonial>;

  // Dashboard Stats
  getDashboardStats(userId: string): Promise<{
    totalClients: number;
    reviewsReceived: number;
    pendingRequests: number;
    avgRating: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getClients(userId: string): Promise<Client[]> {
    return await db.select().from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(desc(clients.createdAt));
  }

  async getClient(id: string, userId: string): Promise<Client | undefined> {
    const result = await db.select().from(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .limit(1);
    return result[0];
  }

  async createClient(client: InsertClient, userId: string): Promise<Client> {
    const result = await db.insert(clients).values({ ...client, userId }).returning();
    return result[0];
  }

  async updateClient(id: string, client: Partial<InsertClient>, userId: string): Promise<Client | undefined> {
    const result = await db.update(clients)
      .set(client)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteClient(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getReviewRequests(userId: string): Promise<ReviewRequest[]> {
    return await db.select().from(reviewRequests)
      .where(eq(reviewRequests.userId, userId))
      .orderBy(desc(reviewRequests.sentAt));
  }

  async getReviewRequest(id: string, userId: string): Promise<ReviewRequest | undefined> {
    const result = await db.select().from(reviewRequests)
      .where(and(eq(reviewRequests.id, id), eq(reviewRequests.userId, userId)))
      .limit(1);
    return result[0];
  }

  async createReviewRequest(request: InsertReviewRequest, userId: string): Promise<ReviewRequest> {
    const result = await db.insert(reviewRequests).values({ ...request, userId }).returning();
    return result[0];
  }

  async updateReviewRequestStatus(id: string, status: string, userId: string): Promise<ReviewRequest | undefined> {
    const result = await db.update(reviewRequests)
      .set({ status, completedAt: status === 'completed' ? new Date() : null })
      .where(and(eq(reviewRequests.id, id), eq(reviewRequests.userId, userId)))
      .returning();
    return result[0];
  }

  async getTestimonials(userId: string): Promise<Testimonial[]> {
    return await db.select().from(testimonials)
      .where(eq(testimonials.userId, userId))
      .orderBy(desc(testimonials.createdAt));
  }

  async getTestimonial(id: string, userId: string): Promise<Testimonial | undefined> {
    const result = await db.select().from(testimonials)
      .where(and(eq(testimonials.id, id), eq(testimonials.userId, userId)))
      .limit(1);
    return result[0];
  }

  async createTestimonial(testimonial: InsertTestimonial, userId: string): Promise<Testimonial> {
    const result = await db.insert(testimonials).values({ ...testimonial, userId }).returning();
    return result[0];
  }

  async getDashboardStats(userId: string): Promise<{
    totalClients: number;
    reviewsReceived: number;
    pendingRequests: number;
    avgRating: number;
  }> {
    const [clientsResult, testimonialsResult, requestsResult] = await Promise.all([
      db.select().from(clients).where(eq(clients.userId, userId)),
      db.select().from(testimonials).where(eq(testimonials.userId, userId)),
      db.select().from(reviewRequests).where(and(eq(reviewRequests.userId, userId), eq(reviewRequests.status, 'pending')))
    ]);

    const avgRating = testimonialsResult.length > 0 
      ? testimonialsResult.reduce((sum, t) => sum + t.rating, 0) / testimonialsResult.length
      : 0;

    return {
      totalClients: clientsResult.length,
      reviewsReceived: testimonialsResult.length,
      pendingRequests: requestsResult.length,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }
}

export const storage = new DatabaseStorage();
