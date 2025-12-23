import { db } from "./db";
import {
  options, history,
  type Option, type InsertOption,
  type HistoryItem, type InsertHistory
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getOptions(): Promise<Option[]>;
  getOption(id: number): Promise<Option | undefined>;
  createOption(option: InsertOption): Promise<Option>;
  updateOption(id: number, updates: Partial<InsertOption>): Promise<Option>;
  deleteOption(id: number): Promise<void>;
  
  getHistory(): Promise<HistoryItem[]>;
  createHistory(item: InsertHistory): Promise<HistoryItem>;
}

export class DatabaseStorage implements IStorage {
  async getOptions(): Promise<Option[]> {
    return await db.select().from(options);
  }

  async getOption(id: number): Promise<Option | undefined> {
    const [option] = await db.select().from(options).where(eq(options.id, id));
    return option;
  }

  async createOption(insertOption: InsertOption): Promise<Option> {
    const [option] = await db.insert(options).values(insertOption).returning();
    return option;
  }

  async updateOption(id: number, updates: Partial<InsertOption>): Promise<Option> {
    const [updated] = await db.update(options).set(updates).where(eq(options.id, id)).returning();
    return updated;
  }

  async deleteOption(id: number): Promise<void> {
    await db.delete(options).where(eq(options.id, id));
  }

  async getHistory(): Promise<HistoryItem[]> {
    return await db.select().from(history).orderBy(desc(history.date));
  }

  async createHistory(item: InsertHistory): Promise<HistoryItem> {
    const [created] = await db.insert(history).values(item).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
