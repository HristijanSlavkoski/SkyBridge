import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const emergencyRequests = pgTable("emergency_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  emergencyType: integer("emergency_type").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  locationDescription: text("location_description"),
  symptoms: text("symptoms"),
  details: json("details"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEmergencyRequestSchema = createInsertSchema(emergencyRequests)
  .omit({ id: true, createdAt: true })
  .extend({
    emergencyType: z.number().min(1).max(5),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    locationDescription: z.string().optional(),
    symptoms: z.string().optional(),
    details: z.record(z.any()).optional(),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEmergencyRequest = z.infer<typeof insertEmergencyRequestSchema>;
export type EmergencyRequest = typeof emergencyRequests.$inferSelect;
