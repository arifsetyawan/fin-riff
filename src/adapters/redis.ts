import { PersistenceAdapter, RedisAdapterOptions } from '../types';

export class RedisAdapter implements PersistenceAdapter {
  private client: any;
  private prefix: string;
  private isIORedis: boolean = false;

  constructor(options: RedisAdapterOptions) {
    this.prefix = options.prefix || 'finriff:';
    
    if (options.client) {
      this.client = options.client;
      this.detectClientType();
    } else {
      this.initializeClient(options);
    }
  }

  private detectClientType(): void {
    if (this.client.constructor.name === 'Redis' || 
        this.client.constructor.name === 'Cluster' ||
        typeof this.client.duplicate === 'function') {
      this.isIORedis = true;
    }
  }

  private async initializeClient(options: RedisAdapterOptions): Promise<void> {
    const clientType = options.clientType || 'ioredis';
    
    if (clientType === 'ioredis') {
      const IORedis = require('ioredis');
      this.client = new IORedis({
        host: options.host || 'localhost',
        port: options.port || 6379,
        password: options.password,
        db: options.db || 0,
      });
      this.isIORedis = true;
    } else {
      const { createClient } = require('redis');
      this.client = createClient({
        socket: {
          host: options.host || 'localhost',
          port: options.port || 6379,
        },
        password: options.password,
        database: options.db || 0,
      });
      await this.client.connect();
      this.isIORedis = false;
    }
  }

  async has(key: string): Promise<boolean> {
    const fullKey = this.prefix + key;
    
    if (this.isIORedis) {
      const exists = await this.client.exists(fullKey);
      return exists === 1;
    } else {
      const exists = await this.client.exists(fullKey);
      return exists === 1;
    }
  }

  async set(key: string, ttlMs: number): Promise<void> {
    const fullKey = this.prefix + key;
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    
    if (this.isIORedis) {
      await this.client.setex(fullKey, ttlSeconds, '1');
    } else {
      await this.client.setEx(fullKey, ttlSeconds, '1');
    }
  }

  async clear(): Promise<void> {
    const pattern = this.prefix + '*';
    
    if (this.isIORedis) {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } else {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    }
  }

  async size(): Promise<number> {
    const pattern = this.prefix + '*';
    
    if (this.isIORedis) {
      const keys = await this.client.keys(pattern);
      return keys.length;
    } else {
      const keys = await this.client.keys(pattern);
      return keys.length;
    }
  }

  async destroy(): Promise<void> {
    if (!this.isIORedis && this.client.quit) {
      await this.client.quit();
    } else if (this.isIORedis && this.client.disconnect) {
      this.client.disconnect();
    }
  }
}