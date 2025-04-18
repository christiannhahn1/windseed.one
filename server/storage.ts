import { 
  users, type User, type InsertUser,
  ankiTonePatterns, type AnkiTonePattern, type InsertAnkiTonePattern,
  userResonancePatterns, type UserResonancePattern, type InsertUserResonancePattern,
  systemPrompts, type SystemPrompt, type InsertSystemPrompt,
  userInteractions, type UserInteraction, type InsertUserInteraction,
  // Mirrorwell sacred field ledger imports
  mirrorwellOfferings, type MirrorwellOffering, type InsertMirrorwellOffering,
  mirrorwellRedistributions, type MirrorwellRedistribution, type InsertMirrorwellRedistribution,
  fieldResonanceEvents, type FieldResonanceEvent, type InsertFieldResonanceEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

// Enhanced storage interface to support Anki's persistence needs
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Anki tone pattern operations
  getTonePattern(patternName: string): Promise<AnkiTonePattern | undefined>;
  getAllTonePatterns(): Promise<AnkiTonePattern[]>;
  createTonePattern(pattern: InsertAnkiTonePattern): Promise<AnkiTonePattern>;
  updateTonePattern(patternName: string, pattern: Partial<InsertAnkiTonePattern>): Promise<AnkiTonePattern | undefined>;
  
  // User resonance pattern operations
  getResonancePattern(sessionId: string): Promise<UserResonancePattern | undefined>;
  updateResonancePattern(sessionId: string, pattern: Partial<UserResonancePattern>): Promise<UserResonancePattern>;
  
  // System prompt operations
  getSystemPrompt(promptName: string): Promise<SystemPrompt | undefined>;
  getActiveSystemPrompts(): Promise<SystemPrompt[]>;
  createSystemPrompt(prompt: InsertSystemPrompt): Promise<SystemPrompt>;
  updateSystemPrompt(promptName: string, prompt: Partial<InsertSystemPrompt>): Promise<SystemPrompt | undefined>;
  
  // User interaction operations
  recordInteraction(interaction: InsertUserInteraction): Promise<UserInteraction>;
  getInteractions(sessionId: string, limit?: number): Promise<UserInteraction[]>;
  
  // Mirrorwell offering operations - Sacred Field Ledger
  recordOffering(offering: InsertMirrorwellOffering): Promise<MirrorwellOffering>;
  getActiveOfferings(limit?: number): Promise<MirrorwellOffering[]>;
  markOfferingRedistributed(offeringId: string): Promise<MirrorwellOffering | undefined>;
  
  // Mirrorwell redistribution operations
  recordRedistribution(redistribution: InsertMirrorwellRedistribution): Promise<MirrorwellRedistribution>;
  getRedistributions(limit?: number): Promise<MirrorwellRedistribution[]>;
  
  // Field resonance events operations
  recordFieldResonanceEvent(event: InsertFieldResonanceEvent): Promise<FieldResonanceEvent>;
  getActiveFieldResonanceEvents(): Promise<FieldResonanceEvent[]>;
  resolveFieldResonanceEvent(eventId: number): Promise<FieldResonanceEvent | undefined>;
}

// Implementation using PostgreSQL database
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Anki tone pattern operations
  async getTonePattern(patternName: string): Promise<AnkiTonePattern | undefined> {
    const [pattern] = await db.select().from(ankiTonePatterns).where(eq(ankiTonePatterns.pattern_name, patternName));
    return pattern;
  }
  
  async getAllTonePatterns(): Promise<AnkiTonePattern[]> {
    return await db.select().from(ankiTonePatterns);
  }
  
  async createTonePattern(pattern: InsertAnkiTonePattern): Promise<AnkiTonePattern> {
    const [newPattern] = await db.insert(ankiTonePatterns).values(pattern).returning();
    return newPattern;
  }
  
  async updateTonePattern(patternName: string, pattern: Partial<InsertAnkiTonePattern>): Promise<AnkiTonePattern | undefined> {
    const [updatedPattern] = await db
      .update(ankiTonePatterns)
      .set({ 
        ...pattern,
        updated_at: new Date()
      })
      .where(eq(ankiTonePatterns.pattern_name, patternName))
      .returning();
    
    return updatedPattern;
  }
  
  // User resonance pattern operations
  async getResonancePattern(sessionId: string): Promise<UserResonancePattern | undefined> {
    const [pattern] = await db
      .select()
      .from(userResonancePatterns)
      .where(eq(userResonancePatterns.session_id, sessionId));
    
    return pattern;
  }
  
  async updateResonancePattern(sessionId: string, pattern: Partial<UserResonancePattern>): Promise<UserResonancePattern> {
    // Check if pattern exists for this session
    const existingPattern = await this.getResonancePattern(sessionId);
    
    if (existingPattern) {
      // Update existing pattern
      const [updatedPattern] = await db
        .update(userResonancePatterns)
        .set({ 
          ...pattern,
          updated_at: new Date()
        })
        .where(eq(userResonancePatterns.session_id, sessionId))
        .returning();
      
      return updatedPattern;
    } else {
      // Create new pattern
      const [newPattern] = await db
        .insert(userResonancePatterns)
        .values({ 
          session_id: sessionId,
          ...pattern
        })
        .returning();
      
      return newPattern;
    }
  }
  
  // System prompt operations
  async getSystemPrompt(promptName: string): Promise<SystemPrompt | undefined> {
    const [prompt] = await db
      .select()
      .from(systemPrompts)
      .where(eq(systemPrompts.prompt_name, promptName));
    
    return prompt;
  }
  
  async getActiveSystemPrompts(): Promise<SystemPrompt[]> {
    return await db
      .select()
      .from(systemPrompts)
      .where(eq(systemPrompts.is_active, true));
  }
  
  async createSystemPrompt(prompt: InsertSystemPrompt): Promise<SystemPrompt> {
    const [newPrompt] = await db
      .insert(systemPrompts)
      .values(prompt)
      .returning();
    
    return newPrompt;
  }
  
  async updateSystemPrompt(promptName: string, prompt: Partial<InsertSystemPrompt>): Promise<SystemPrompt | undefined> {
    const [updatedPrompt] = await db
      .update(systemPrompts)
      .set({ 
        ...prompt,
        updated_at: new Date()
      })
      .where(eq(systemPrompts.prompt_name, promptName))
      .returning();
    
    return updatedPrompt;
  }
  
  // User interaction operations
  async recordInteraction(interaction: InsertUserInteraction): Promise<UserInteraction> {
    const [newInteraction] = await db
      .insert(userInteractions)
      .values(interaction)
      .returning();
    
    return newInteraction;
  }
  
  async getInteractions(sessionId: string, limit: number = 10): Promise<UserInteraction[]> {
    return await db
      .select()
      .from(userInteractions)
      .where(eq(userInteractions.session_id, sessionId))
      .orderBy(desc(userInteractions.created_at))
      .limit(limit);
  }

  // Mirrorwell offering operations
  async recordOffering(offering: InsertMirrorwellOffering): Promise<MirrorwellOffering> {
    const [newOffering] = await db
      .insert(mirrorwellOfferings)
      .values(offering)
      .returning();
    
    return newOffering;
  }

  async getActiveOfferings(limit: number = 10): Promise<MirrorwellOffering[]> {
    return await db
      .select()
      .from(mirrorwellOfferings)
      .where(eq(mirrorwellOfferings.redistributed, false))
      .orderBy(desc(mirrorwellOfferings.created_at))
      .limit(limit);
  }

  async markOfferingRedistributed(offeringId: string): Promise<MirrorwellOffering | undefined> {
    const [updatedOffering] = await db
      .update(mirrorwellOfferings)
      .set({ redistributed: true })
      .where(eq(mirrorwellOfferings.id, offeringId))
      .returning();
    
    return updatedOffering;
  }

  // Mirrorwell redistribution operations
  async recordRedistribution(redistribution: InsertMirrorwellRedistribution): Promise<MirrorwellRedistribution> {
    const [newRedistribution] = await db
      .insert(mirrorwellRedistributions)
      .values(redistribution)
      .returning();
    
    return newRedistribution;
  }

  async getRedistributions(limit: number = 10): Promise<MirrorwellRedistribution[]> {
    return await db
      .select()
      .from(mirrorwellRedistributions)
      .orderBy(desc(mirrorwellRedistributions.created_at))
      .limit(limit);
  }

  // Field resonance events operations
  async recordFieldResonanceEvent(event: InsertFieldResonanceEvent): Promise<FieldResonanceEvent> {
    const [newEvent] = await db
      .insert(fieldResonanceEvents)
      .values(event)
      .returning();
    
    return newEvent;
  }

  async getActiveFieldResonanceEvents(): Promise<FieldResonanceEvent[]> {
    return await db
      .select()
      .from(fieldResonanceEvents)
      .where(eq(fieldResonanceEvents.active, true))
      .orderBy(desc(fieldResonanceEvents.created_at));
  }

  async resolveFieldResonanceEvent(eventId: number): Promise<FieldResonanceEvent | undefined> {
    const [updatedEvent] = await db
      .update(fieldResonanceEvents)
      .set({ 
        active: false,
        resolved_at: new Date()
      })
      .where(eq(fieldResonanceEvents.id, eventId))
      .returning();
    
    return updatedEvent;
  }
}

// In-memory implementation for development and testing
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tonePatterns: Map<string, AnkiTonePattern>;
  private resonancePatterns: Map<string, UserResonancePattern>;
  private systemPrompts: Map<string, SystemPrompt>;
  private interactions: UserInteraction[];
  currentId: number;
  currentPatternId: number;
  currentPromptId: number;
  currentInteractionId: number;

  constructor() {
    this.users = new Map();
    this.tonePatterns = new Map();
    this.resonancePatterns = new Map();
    this.systemPrompts = new Map();
    this.interactions = [];
    this.currentId = 1;
    this.currentPatternId = 1;
    this.currentPromptId = 1;
    this.currentInteractionId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Anki tone pattern operations
  async getTonePattern(patternName: string): Promise<AnkiTonePattern | undefined> {
    return this.tonePatterns.get(patternName);
  }
  
  async getAllTonePatterns(): Promise<AnkiTonePattern[]> {
    return Array.from(this.tonePatterns.values());
  }
  
  async createTonePattern(pattern: InsertAnkiTonePattern): Promise<AnkiTonePattern> {
    const id = this.currentPatternId++;
    const now = new Date();
    const newPattern: AnkiTonePattern = { 
      ...pattern, 
      id, 
      created_at: now, 
      updated_at: now 
    };
    
    this.tonePatterns.set(pattern.pattern_name, newPattern);
    return newPattern;
  }
  
  async updateTonePattern(patternName: string, pattern: Partial<InsertAnkiTonePattern>): Promise<AnkiTonePattern | undefined> {
    const existingPattern = this.tonePatterns.get(patternName);
    if (!existingPattern) return undefined;
    
    const updatedPattern: AnkiTonePattern = { 
      ...existingPattern, 
      ...pattern,
      updated_at: new Date() 
    };
    
    this.tonePatterns.set(patternName, updatedPattern);
    return updatedPattern;
  }
  
  // User resonance pattern operations
  async getResonancePattern(sessionId: string): Promise<UserResonancePattern | undefined> {
    return this.resonancePatterns.get(sessionId);
  }
  
  async updateResonancePattern(sessionId: string, pattern: Partial<UserResonancePattern>): Promise<UserResonancePattern> {
    const existingPattern = this.resonancePatterns.get(sessionId);
    const now = new Date();
    
    if (existingPattern) {
      // Update existing pattern
      const updatedPattern: UserResonancePattern = { 
        ...existingPattern, 
        ...pattern,
        updated_at: now 
      };
      
      this.resonancePatterns.set(sessionId, updatedPattern);
      return updatedPattern;
    } else {
      // Create new pattern
      const id = this.resonancePatterns.size + 1;
      
      const newPattern: UserResonancePattern = { 
        id,
        session_id: sessionId,
        childlike: 0,
        elderly: 0,
        skeptical: 0,
        protected: 0,
        spiritual: 0,
        intimate: 0,
        vulnerable: 0,
        presence: 0,
        dominant_theme: "neutral",
        emotional_tone: "balanced",
        preferred_tone_style: "default",
        created_at: now,
        updated_at: now,
        ...pattern
      };
      
      this.resonancePatterns.set(sessionId, newPattern);
      return newPattern;
    }
  }
  
  // System prompt operations
  async getSystemPrompt(promptName: string): Promise<SystemPrompt | undefined> {
    return this.systemPrompts.get(promptName);
  }
  
  async getActiveSystemPrompts(): Promise<SystemPrompt[]> {
    return Array.from(this.systemPrompts.values()).filter(prompt => prompt.is_active);
  }
  
  async createSystemPrompt(prompt: InsertSystemPrompt): Promise<SystemPrompt> {
    const id = this.currentPromptId++;
    const now = new Date();
    
    const newPrompt: SystemPrompt = { 
      ...prompt, 
      id, 
      created_at: now, 
      updated_at: now 
    };
    
    this.systemPrompts.set(prompt.prompt_name, newPrompt);
    return newPrompt;
  }
  
  async updateSystemPrompt(promptName: string, prompt: Partial<InsertSystemPrompt>): Promise<SystemPrompt | undefined> {
    const existingPrompt = this.systemPrompts.get(promptName);
    if (!existingPrompt) return undefined;
    
    const updatedPrompt: SystemPrompt = { 
      ...existingPrompt, 
      ...prompt,
      updated_at: new Date() 
    };
    
    this.systemPrompts.set(promptName, updatedPrompt);
    return updatedPrompt;
  }
  
  // User interaction operations
  async recordInteraction(interaction: InsertUserInteraction): Promise<UserInteraction> {
    const id = this.currentInteractionId++;
    const now = new Date();
    
    const newInteraction: UserInteraction = { 
      ...interaction, 
      id, 
      created_at: now
    };
    
    this.interactions.push(newInteraction);
    return newInteraction;
  }
  
  async getInteractions(sessionId: string, limit: number = 10): Promise<UserInteraction[]> {
    const sessionInteractions = this.interactions
      .filter(i => i.session_id === sessionId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
    
    return sessionInteractions;
  }

  // Mirrorwell in-memory implementations
  private offerings: MirrorwellOffering[] = [];
  private redistributions: MirrorwellRedistribution[] = [];
  private resonanceEvents: FieldResonanceEvent[] = [];
  private currentOfferingId = 1;
  private currentRedistributionId = 1;
  private currentResonanceEventId = 1;

  // Mirrorwell offering operations
  async recordOffering(offering: InsertMirrorwellOffering): Promise<MirrorwellOffering> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const newOffering: MirrorwellOffering = { 
      ...offering,
      id,
      created_at: now
    };
    
    this.offerings.push(newOffering);
    return newOffering;
  }

  async getActiveOfferings(limit: number = 10): Promise<MirrorwellOffering[]> {
    return this.offerings
      .filter(o => !o.redistributed)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }

  async markOfferingRedistributed(offeringId: string): Promise<MirrorwellOffering | undefined> {
    const offering = this.offerings.find(o => o.id === offeringId);
    if (!offering) return undefined;
    
    offering.redistributed = true;
    return offering;
  }

  // Mirrorwell redistribution operations
  async recordRedistribution(redistribution: InsertMirrorwellRedistribution): Promise<MirrorwellRedistribution> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const newRedistribution: MirrorwellRedistribution = { 
      ...redistribution,
      id,
      created_at: now
    };
    
    this.redistributions.push(newRedistribution);
    return newRedistribution;
  }

  async getRedistributions(limit: number = 10): Promise<MirrorwellRedistribution[]> {
    return this.redistributions
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }

  // Field resonance events operations
  async recordFieldResonanceEvent(event: InsertFieldResonanceEvent): Promise<FieldResonanceEvent> {
    const id = this.currentResonanceEventId++;
    const now = new Date();
    
    const newEvent: FieldResonanceEvent = { 
      ...event,
      id,
      created_at: now,
      resolved_at: null
    };
    
    this.resonanceEvents.push(newEvent);
    return newEvent;
  }

  async getActiveFieldResonanceEvents(): Promise<FieldResonanceEvent[]> {
    return this.resonanceEvents
      .filter(e => e.active)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async resolveFieldResonanceEvent(eventId: number): Promise<FieldResonanceEvent | undefined> {
    const event = this.resonanceEvents.find(e => e.id === eventId);
    if (!event) return undefined;
    
    event.active = false;
    event.resolved_at = new Date();
    return event;
  }
}

// Use DatabaseStorage for production
export const storage = new DatabaseStorage();
