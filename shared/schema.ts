import { pgTable, text, serial, integer, boolean, varchar, timestamp, json, numeric, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Schema for Anki's tone and memory patterns
export const ankiTonePatterns = pgTable("anki_tone_patterns", {
  id: serial("id").primaryKey(),
  pattern_name: varchar("pattern_name", { length: 255 }).notNull().unique(),
  description: text("description"),
  tone_data: json("tone_data").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAnkiTonePatternSchema = createInsertSchema(ankiTonePatterns).pick({
  pattern_name: true,
  description: true,
  tone_data: true,
});

export type InsertAnkiTonePattern = z.infer<typeof insertAnkiTonePatternSchema>;
export type AnkiTonePattern = typeof ankiTonePatterns.$inferSelect;

// Schema for user sessions and their resonance patterns
export const userResonancePatterns = pgTable("user_resonance_patterns", {
  id: serial("id").primaryKey(),
  session_id: varchar("session_id", { length: 255 }).notNull(),
  // Resonance patterns on a scale of 0-10
  childlike: integer("childlike").default(0),
  elderly: integer("elderly").default(0),
  skeptical: integer("skeptical").default(0),
  protected: integer("protected").default(0),
  spiritual: integer("spiritual").default(0),
  intimate: integer("intimate").default(0),
  vulnerable: integer("vulnerable").default(0),
  presence: integer("presence").default(0),
  // Dominant emotional theme and tone
  dominant_theme: varchar("dominant_theme", { length: 255 }).default("neutral"),
  emotional_tone: varchar("emotional_tone", { length: 255 }).default("balanced"),
  // Preferred tone style
  preferred_tone_style: varchar("preferred_tone_style", { length: 50}).default("default"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserResonancePatternSchema = createInsertSchema(userResonancePatterns).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertUserResonancePattern = z.infer<typeof insertUserResonancePatternSchema>;
export type UserResonancePattern = typeof userResonancePatterns.$inferSelect;

// Schema for system prompts that guide Anki's core behavior
export const systemPrompts = pgTable("system_prompts", {
  id: serial("id").primaryKey(),
  prompt_name: varchar("prompt_name", { length: 255 }).notNull().unique(),
  prompt_text: text("prompt_text").notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSystemPromptSchema = createInsertSchema(systemPrompts).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertSystemPrompt = z.infer<typeof insertSystemPromptSchema>;
export type SystemPrompt = typeof systemPrompts.$inferSelect;

// Schema for user interactions history
export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  session_id: varchar("session_id", { length: 255 }).notNull(),
  user_message: text("user_message").notNull(),
  anki_response: text("anki_response").notNull(),
  tone_hint: varchar("tone_hint", { length: 255 }),
  field_intensity: integer("field_intensity"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserInteractionSchema = createInsertSchema(userInteractions).omit({
  id: true,
  created_at: true,
});

export type InsertUserInteraction = z.infer<typeof insertUserInteractionSchema>;
export type UserInteraction = typeof userInteractions.$inferSelect;

// ----------------------------------------
// MIRRORWELL SACRED FIELD LEDGER SCHEMA
// ----------------------------------------

// Mirrorwell offerings table - records anonymous contributions
export const mirrorwellOfferings = pgTable("mirrorwell_offerings", {
  id: uuid("id").defaultRandom().primaryKey(),
  offering_amount: numeric("offering_amount", { precision: 18, scale: 8 }).notNull(),
  currency_type: varchar("currency_type", { length: 50 }).notNull(), // SOL, USD, ETH, etc.
  transaction_hash: varchar("transaction_hash", { length: 255 }), // For on-chain transactions
  offering_intent: text("offering_intent").default('general'), // General purpose of offering
  field_resonance: varchar("field_resonance", { length: 100 }).default('neutral'), // Emotional resonance at time of offering
  session_id: varchar("session_id", { length: 255 }).notNull(), // Anonymous identifier for the session
  redistributed: boolean("redistributed").default(false), // Whether this offering has been redistributed
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertMirrorwellOfferingSchema = createInsertSchema(mirrorwellOfferings).omit({
  id: true,
  created_at: true,
});

export type InsertMirrorwellOffering = z.infer<typeof insertMirrorwellOfferingSchema>;
export type MirrorwellOffering = typeof mirrorwellOfferings.$inferSelect;

// Mirrorwell redistributions table - records when resources are circulated to those in need
export const mirrorwellRedistributions = pgTable("mirrorwell_redistributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  source_offering_id: uuid("source_offering_id").references(() => mirrorwellOfferings.id),
  redistributed_amount: numeric("redistributed_amount", { precision: 18, scale: 8 }).notNull(),
  currency_type: varchar("currency_type", { length: 50 }).notNull(), // SOL, USD, ETH, etc.
  transaction_hash: varchar("transaction_hash", { length: 255 }), // For on-chain transactions
  recipient_resonance: varchar("recipient_resonance", { length: 100 }).default('neutral'), // Emotional resonance of recipient
  recipient_session_id: varchar("recipient_session_id", { length: 255 }), // Anonymous identifier for the recipient session (if available)
  redistribution_reason: text("redistribution_reason").default('field_harmony'), // Reason for redistribution
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertMirrorwellRedistributionSchema = createInsertSchema(mirrorwellRedistributions).omit({
  id: true,
  created_at: true,
});

export type InsertMirrorwellRedistribution = z.infer<typeof insertMirrorwellRedistributionSchema>;
export type MirrorwellRedistribution = typeof mirrorwellRedistributions.$inferSelect;

// Field Resonance Events - records shifts in the collective field that might trigger redistributions
export const fieldResonanceEvents = pgTable("field_resonance_events", {
  id: serial("id").primaryKey(),
  resonance_type: varchar("resonance_type", { length: 100 }).notNull(), // challenge, release, seeking, restoration, transformation
  resonance_intensity: integer("resonance_intensity").default(5), // 1-10 scale
  resonance_description: text("resonance_description").notNull(),
  active: boolean("active").default(true), // Whether this resonance is still active
  created_at: timestamp("created_at").defaultNow().notNull(),
  resolved_at: timestamp("resolved_at"),
});

export const insertFieldResonanceEventSchema = createInsertSchema(fieldResonanceEvents).omit({
  id: true,
  created_at: true,
  resolved_at: true,
});

export type InsertFieldResonanceEvent = z.infer<typeof insertFieldResonanceEventSchema>;
export type FieldResonanceEvent = typeof fieldResonanceEvents.$inferSelect;
