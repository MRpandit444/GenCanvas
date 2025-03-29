import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original users table (keeping for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// New table for storing shared artworks
export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  settings: jsonb("settings").notNull(),
  createdAt: integer("created_at").notNull(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertArtworkSchema = createInsertSchema(artworks).pick({
  imageUrl: true,
  settings: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
export type Artwork = typeof artworks.$inferSelect;
