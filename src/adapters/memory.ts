import { PersistenceAdapter } from '../types';

interface MemoryEntry {
  expiresAt: number;
}

export class MemoryAdapter implements PersistenceAdapter {
  private store: Map<string, MemoryEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private cleanupIntervalMs: number = 60000;

  constructor(cleanupIntervalMs: number = 60000) {
    this.cleanupIntervalMs = cleanupIntervalMs;
    this.startCleanup();
  }

  async has(key: string): Promise<boolean> {
    this.cleanupExpired();
    const entry = this.store.get(key);
    
    if (!entry) {
      return false;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    
    return true;
  }

  async set(key: string, ttlMs: number): Promise<void> {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { expiresAt });
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async size(): Promise<number> {
    this.cleanupExpired();
    return this.store.size;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, this.cleanupIntervalMs);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}