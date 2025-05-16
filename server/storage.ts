import { users, type User, type InsertUser, emergencyRequests, type EmergencyRequest, type InsertEmergencyRequest } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Emergency request methods
  createEmergencyRequest(request: InsertEmergencyRequest): Promise<EmergencyRequest>;
  getEmergencyRequest(id: number): Promise<EmergencyRequest | undefined>;
  updateEmergencyRequestStatus(id: number, status: string): Promise<EmergencyRequest | undefined>;
  getEmergencyRequestsByUserId(userId: number): Promise<EmergencyRequest[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emergencyRequests: Map<number, EmergencyRequest>;
  private userId: number;
  private emergencyId: number;

  constructor() {
    this.users = new Map();
    this.emergencyRequests = new Map();
    this.userId = 1;
    this.emergencyId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createEmergencyRequest(insertRequest: InsertEmergencyRequest): Promise<EmergencyRequest> {
    const id = this.emergencyId++;
    const now = new Date();
    const emergencyRequest: EmergencyRequest = {
      ...insertRequest,
      id,
      status: "pending",
      createdAt: now,
      details: insertRequest.details || {},
      userId: insertRequest.userId || null,
      latitude: insertRequest.latitude || null,
      longitude: insertRequest.longitude || null,
      locationDescription: insertRequest.locationDescription || null,
      symptoms: insertRequest.symptoms || null
    };
    this.emergencyRequests.set(id, emergencyRequest);
    return emergencyRequest;
  }

  async getEmergencyRequest(id: number): Promise<EmergencyRequest | undefined> {
    return this.emergencyRequests.get(id);
  }

  async updateEmergencyRequestStatus(id: number, status: string): Promise<EmergencyRequest | undefined> {
    const request = this.emergencyRequests.get(id);
    if (request) {
      const updatedRequest = { ...request, status };
      this.emergencyRequests.set(id, updatedRequest);
      return updatedRequest;
    }
    return undefined;
  }

  async getEmergencyRequestsByUserId(userId: number): Promise<EmergencyRequest[]> {
    return Array.from(this.emergencyRequests.values()).filter(
      (request) => request.userId === userId
    );
  }
}

export const storage = new MemStorage();
