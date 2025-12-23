import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertOptionSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed data if empty
  const existing = await storage.getOptions();
  if (existing.length === 0) {
    const seeds = [
      { name: "Local Thai", cuisine: "Thai", price: "$$", kidFriendly: 4, dairyFree: true, dairyFreeNotes: "Curries with coconut milk", healthyScore: 4, fatCaution: "medium", delivery: true, pickup: true, familyRating: 4 },
      { name: "Sushi Train", cuisine: "Japanese", price: "$$", kidFriendly: 5, dairyFree: true, dairyFreeNotes: "Most items naturally dairy free", healthyScore: 5, fatCaution: "low", delivery: false, pickup: true, familyRating: 5 },
      { name: "Joe's Pizza", cuisine: "Pizza", price: "$", kidFriendly: 5, dairyFree: false, dairyFreeNotes: "Ask for no cheese", healthyScore: 2, fatCaution: "high", delivery: true, pickup: true, familyRating: 5 },
      { name: "Burger Shack", cuisine: "Burgers", price: "$", kidFriendly: 4, dairyFree: false, dairyFreeNotes: "Bun has milk", healthyScore: 1, fatCaution: "high", delivery: true, pickup: true, familyRating: 3 },
      { name: "Vietnamese Pho", cuisine: "Vietnamese", price: "$", kidFriendly: 3, dairyFree: true, dairyFreeNotes: "Broth is clear", healthyScore: 5, fatCaution: "low", delivery: true, pickup: true, familyRating: 4 },
      { name: "Indian Curry House", cuisine: "Indian", price: "$$", kidFriendly: 3, dairyFree: false, dairyFreeNotes: "Many cream based sauces", healthyScore: 3, fatCaution: "high", delivery: true, pickup: true, familyRating: 4 },
      { name: "Fish & Chips", cuisine: "Seafood", price: "$", kidFriendly: 5, dairyFree: true, dairyFreeNotes: "Batter might have milk", healthyScore: 2, fatCaution: "high", delivery: false, pickup: true, familyRating: 4 },
      { name: "Healthy Salad Bar", cuisine: "Salad", price: "$$", kidFriendly: 1, dairyFree: true, dairyFreeNotes: "Vinaigrettes ok", healthyScore: 5, fatCaution: "low", delivery: true, pickup: true, familyRating: 2 },
      { name: "Taco Stand", cuisine: "Mexican", price: "$", kidFriendly: 4, dairyFree: true, dairyFreeNotes: "Corn tortillas, no cheese", healthyScore: 3, fatCaution: "medium", delivery: true, pickup: true, familyRating: 5 },
      { name: "Chinese Takeout", cuisine: "Chinese", price: "$", kidFriendly: 4, dairyFree: true, dairyFreeNotes: "Avoid egg dishes if sensitive", healthyScore: 2, fatCaution: "high", delivery: true, pickup: true, familyRating: 3 },
      { name: "Kebab Shop", cuisine: "Middle Eastern", price: "$", kidFriendly: 3, dairyFree: true, dairyFreeNotes: "Garlic sauce often has yogurt", healthyScore: 3, fatCaution: "high", delivery: false, pickup: true, familyRating: 4 },
      { name: "Noodle Box", cuisine: "Asian Fusion", price: "$", kidFriendly: 5, dairyFree: true, dairyFreeNotes: "Rice noodles safe", healthyScore: 3, fatCaution: "medium", delivery: true, pickup: true, familyRating: 3 },
    ];
    for (const seed of seeds) {
       await storage.createOption(seed as any);
    }
  }

  app.get(api.options.list.path, async (req, res) => {
    const options = await storage.getOptions();
    res.json(options);
  });

  app.get(api.options.get.path, async (req, res) => {
    const option = await storage.getOption(Number(req.params.id));
    if (!option) return res.status(404).json({ message: "Not found" });
    res.json(option);
  });

  app.post(api.options.create.path, async (req, res) => {
    try {
      const input = api.options.create.input.parse(req.body);
      const option = await storage.createOption(input);
      res.status(201).json(option);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.options.update.path, async (req, res) => {
    try {
      const input = api.options.update.input.parse(req.body);
      const option = await storage.updateOption(Number(req.params.id), input);
      if (!option) return res.status(404).json({ message: "Not found" });
      res.json(option);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.options.delete.path, async (req, res) => {
    await storage.deleteOption(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.options.lockIn.path, async (req, res) => {
    const id = Number(req.params.id);
    const option = await storage.getOption(id);
    if (!option) return res.status(404).json({ message: "Not found" });

    // Update last ordered
    await storage.updateOption(id, { lastOrdered: new Date() });
    
    // Add to history
    await storage.createHistory({
      optionId: id,
      nameSnapshot: option.name,
    });

    res.json(option);
  });

  app.get(api.history.list.path, async (req, res) => {
    const history = await storage.getHistory();
    res.json(history);
  });

  return httpServer;
}
