import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmergencyRequestSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Emergency requests endpoints
  app.post("/api/emergency-requests", async (req, res) => {
    try {
      const validatedData = insertEmergencyRequestSchema.parse(req.body);
      const emergencyRequest = await storage.createEmergencyRequest(validatedData);
      res.status(201).json(emergencyRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/emergency-requests/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const emergencyRequest = await storage.getEmergencyRequest(id);
    if (!emergencyRequest) {
      return res.status(404).json({ message: "Emergency request not found" });
    }

    res.json(emergencyRequest);
  });

  app.patch("/api/emergency-requests/:id/status", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const { status } = req.body;
    if (!status || typeof status !== "string") {
      return res.status(400).json({ message: "Status is required and must be a string" });
    }

    const updatedRequest = await storage.updateEmergencyRequestStatus(id, status);
    if (!updatedRequest) {
      return res.status(404).json({ message: "Emergency request not found" });
    }

    res.json(updatedRequest);
  });

  // Mock Galileo SAR integration endpoint
  app.get("/api/galileo-sar/status", (req, res) => {
    // Simulate checking Galileo SAR satellite status
    res.json({
      status: "operational",
      satellites: {
        available: 24,
        total: 30
      },
      signalStrength: 0.85,
      lastUpdated: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
