import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArtworkSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get('/api/artworks', async (req: Request, res: Response) => {
    try {
      const artworks = await storage.getArtworks();
      res.json(artworks);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/artworks/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid artwork ID' });
      }
      
      const artwork = await storage.getArtwork(id);
      if (!artwork) {
        return res.status(404).json({ message: 'Artwork not found' });
      }
      
      res.json(artwork);
    } catch (error) {
      console.error('Error fetching artwork:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/artworks', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const parsed = insertArtworkSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: 'Invalid artwork data',
          errors: parsed.error.errors 
        });
      }
      
      // Create artwork
      const artwork = await storage.createArtwork(parsed.data);
      res.status(201).json(artwork);
    } catch (error) {
      console.error('Error creating artwork:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/artworks/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid artwork ID' });
      }
      
      const deleted = await storage.deleteArtwork(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Artwork not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting artwork:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
