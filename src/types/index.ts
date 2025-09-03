export interface FinRiffOptions {
  length?: number;
  ttl?: number;
  adapter?: PersistenceAdapter;
  charset?: string;
}

export interface PersistenceAdapter {
  has(key: string): Promise<boolean>;
  set(key: string, ttlMs: number): Promise<void>;
  clear(): Promise<void>;
  size(): Promise<number>;
}

export interface RedisAdapterOptions {
  client?: any;
  prefix?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  clientType?: 'redis' | 'ioredis';
}

export class DuplicateReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateReferenceError';
  }
}