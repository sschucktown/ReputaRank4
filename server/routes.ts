import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { validateJWT, type AuthenticatedRequest } from "./middleware/validateJWT";
import { insertClientSchema, insertReviewRequestSchema, insertTestimonialSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply JWT validation to all /api/* routes
  app.use("/api", validateJWT);

  // Auth routes
  app.get("/api/auth/user", async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      res.json(req.user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Client routes
  app.get("/api/clients", async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const clients = await storage.getClients(req.user.id);
      res.json(clients);
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ message: "Failed to get clients" });
    }
  });

  app.post("/api/clients", async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData, req.user.id);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      console.error("Create client error:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData, req.user.id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      console.error("Update client error:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;
      const deleted = await storage.deleteClient(id, req.user.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Delete client error:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Review request routes
  app.get("/api/review-requests", async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const requests = await storage.getReviewRequests(req.user.id);
      res.json(requests);
    } catch (error) {
      console.error("Get review requests error:", error);
      res.status(500).json({ message: "Failed to get review requests" });
    }
  });

  app.post("/api/review-requests", async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const validatedData = insertReviewRequestSchema.parse(req.body);
      const request = await storage.createReviewRequest(validatedData, req.user.id);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Create review request error:", error);
      res.status(500).json({ message: "Failed to create review request" });
    }
  });

  app.put("/api/review-requests/:id/status", async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !["pending", "completed", "expired"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const request = await storage.updateReviewRequestStatus(id, status, req.user.id);
      
      if (!request) {
        return res.status(404).json({ message: "Review request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Update review request status error:", error);
      res.status(500).json({ message: "Failed to update review request status" });
    }
  });

  // Testimonial routes
  app.get("/api/testimonials", async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const testimonials = await storage.getTestimonials(req.user.id);
      res.json(testimonials);
    } catch (error) {
      console.error("Get testimonials error:", error);
      res.status(500).json({ message: "Failed to get testimonials" });
    }
  });

  app.post("/api/testimonials", async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validatedData, req.user.id);
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid testimonial data", errors: error.errors });
      }
      console.error("Create testimonial error:", error);
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const stats = await storage.getDashboardStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
