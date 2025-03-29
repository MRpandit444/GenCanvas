import { users, type User, type InsertUser } from "@shared/schema";
import { artworks, type Artwork, type InsertArtwork } from "@shared/schema";

// Modify the interface with any CRUD methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Artwork-related methods
  getArtwork(id: number): Promise<Artwork | undefined>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  getArtworks(): Promise<Artwork[]>;
  deleteArtwork(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private artworksMap: Map<number, Artwork>;
  private userIdCounter: number;
  private artworkIdCounter: number;

  constructor() {
    this.users = new Map();
    this.artworksMap = new Map();
    this.userIdCounter = 1;
    this.artworkIdCounter = 1;
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
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getArtwork(id: number): Promise<Artwork | undefined> {
    return this.artworksMap.get(id);
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const id = this.artworkIdCounter++;
    const artwork: Artwork = { ...insertArtwork, id };
    this.artworksMap.set(id, artwork);
    return artwork;
  }

  async getArtworks(): Promise<Artwork[]> {
    return Array.from(this.artworksMap.values());
  }

  async deleteArtwork(id: number): Promise<boolean> {
    return this.artworksMap.delete(id);
  }
}

export const storage = new MemStorage();
