import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const options = pgTable("options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull(), // Comma separated tags
  price: text("price").notNull(), // $, $$, $$$
  kidFriendly: integer("kid_friendly").notNull().default(3), // 1-5
  dairyFree: boolean("dairy_free").notNull().default(false),
  dairyFreeNotes: text("dairy_free_notes"),
  healthyScore: integer("healthy_score").notNull().default(3), // 1-5
  fatCaution: text("fat_caution").notNull().default("medium"), // low, medium, high
  delivery: boolean("delivery").notNull().default(true),
  pickup: boolean("pickup").notNull().default(true),
  notes: text("notes"),
  familyRating: integer("family_rating").notNull().default(3), // 1-5
  lastOrdered: timestamp("last_ordered"),
});

export const history = pgTable("history", {
  id: serial("id").primaryKey(),
  optionId: integer("option_id").notNull(),
  nameSnapshot: text("name_snapshot").notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

export const insertOptionSchema = createInsertSchema(options).omit({ id: true, lastOrdered: true });
export const insertHistorySchema = createInsertSchema(history).omit({ id: true, date: true });

export type Option = typeof options.$inferSelect;
export type InsertOption = z.infer<typeof insertOptionSchema>;
export type HistoryItem = typeof history.$inferSelect;
export type InsertHistory = z.infer<typeof insertHistorySchema>;
