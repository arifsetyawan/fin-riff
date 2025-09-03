import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryAdapter } from './memory';

describe('MemoryAdapter', () => {
  let adapter: MemoryAdapter;

  beforeEach(() => {
    adapter = new MemoryAdapter();
  });

  afterEach(() => {
    adapter.destroy();
  });

  describe('has', () => {
    it('should return false for non-existent key', async () => {
      const exists = await adapter.has('nonexistent');
      expect(exists).toBe(false);
    });

    it('should return true for existing key', async () => {
      await adapter.set('key1', 60000);
      const exists = await adapter.has('key1');
      expect(exists).toBe(true);
    });

    it('should return false for expired key', async () => {
      await adapter.set('key2', 100);
      await new Promise(resolve => setTimeout(resolve, 150));
      const exists = await adapter.has('key2');
      expect(exists).toBe(false);
    });
  });

  describe('set', () => {
    it('should store key with TTL', async () => {
      await adapter.set('key3', 60000);
      expect(await adapter.has('key3')).toBe(true);
    });

    it('should overwrite existing key', async () => {
      await adapter.set('key4', 100);
      await adapter.set('key4', 60000);
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(await adapter.has('key4')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all keys', async () => {
      await adapter.set('key5', 60000);
      await adapter.set('key6', 60000);
      expect(await adapter.size()).toBe(2);
      await adapter.clear();
      expect(await adapter.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return correct count', async () => {
      expect(await adapter.size()).toBe(0);
      await adapter.set('key7', 60000);
      expect(await adapter.size()).toBe(1);
      await adapter.set('key8', 60000);
      expect(await adapter.size()).toBe(2);
    });

    it('should not count expired keys', async () => {
      await adapter.set('key9', 100);
      await adapter.set('key10', 60000);
      expect(await adapter.size()).toBe(2);
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(await adapter.size()).toBe(1);
    });
  });

  describe('cleanup', () => {
    it('should automatically clean expired entries', async () => {
      const cleanupAdapter = new MemoryAdapter(100);
      await cleanupAdapter.set('key11', 50);
      await cleanupAdapter.set('key12', 60000);
      
      expect(await cleanupAdapter.size()).toBe(2);
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(await cleanupAdapter.size()).toBe(1);
      
      cleanupAdapter.destroy();
    });
  });
});