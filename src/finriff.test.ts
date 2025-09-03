import { describe, it, expect, beforeEach } from 'vitest';
import { FinRiff } from './finriff';
import { MemoryAdapter } from './adapters/memory';
import { SAFE_CHARSET } from './utils/charset';

describe('FinRiff', () => {
  let finriff: FinRiff;

  beforeEach(() => {
    finriff = new FinRiff();
  });

  describe('constructor', () => {
    it('should use default charset and length', () => {
      expect(finriff.getCharset()).toBe(SAFE_CHARSET);
      expect(finriff.getDefaultLength()).toBe(6);
    });

    it('should accept custom options', () => {
      const customFinriff = new FinRiff({
        length: 8,
        ttl: 1000,
        charset: 'ABC123',
      });
      expect(customFinriff.getCharset()).toBe('ABC123');
      expect(customFinriff.getDefaultLength()).toBe(8);
      expect(customFinriff.getTTL()).toBe(1000);
    });

    it('should throw error for invalid charset', () => {
      expect(() => new FinRiff({ charset: 'A' })).toThrow('Invalid charset');
      expect(() => new FinRiff({ charset: 'AAA' })).toThrow('Invalid charset');
    });

    it('should throw error for invalid length', () => {
      expect(() => new FinRiff({ length: 0 })).toThrow('Length must be between');
      expect(() => new FinRiff({ length: 13 })).toThrow('Length must be between');
    });
  });

  describe('generate', () => {
    it('should generate reference with default length', async () => {
      const ref = await finriff.generate();
      expect(ref).toHaveLength(6);
      expect(ref.split('').every(char => SAFE_CHARSET.includes(char))).toBe(true);
    });

    it('should generate reference with custom length', async () => {
      const ref = await finriff.generate(10);
      expect(ref).toHaveLength(10);
    });

    it('should generate unique references', async () => {
      const refs = new Set<string>();
      for (let i = 0; i < 100; i++) {
        refs.add(await finriff.generate());
      }
      expect(refs.size).toBe(100);
    });

    it('should reject duplicate references', async () => {
      const ref = await finriff.generate();
      const isUnique = await finriff.isUnique(ref);
      expect(isUnique).toBe(false);
    });
  });

  describe('generateBatch', () => {
    it('should generate multiple references', async () => {
      const refs = await finriff.generateBatch(10);
      expect(refs).toHaveLength(10);
      const uniqueRefs = new Set(refs);
      expect(uniqueRefs.size).toBe(10);
    });

    it('should generate batch with custom length', async () => {
      const refs = await finriff.generateBatch(5, 8);
      expect(refs).toHaveLength(5);
      refs.forEach(ref => expect(ref).toHaveLength(8));
    });
  });

  describe('isUnique', () => {
    it('should return true for new reference', async () => {
      const isUnique = await finriff.isUnique('NEWREF');
      expect(isUnique).toBe(true);
    });

    it('should return false for existing reference', async () => {
      const ref = await finriff.generate();
      const isUnique = await finriff.isUnique(ref);
      expect(isUnique).toBe(false);
    });
  });

  describe('reserve', () => {
    it('should reserve a new reference', async () => {
      const reserved = await finriff.reserve('CUSTOM1');
      expect(reserved).toBe(true);
      const isUnique = await finriff.isUnique('CUSTOM1');
      expect(isUnique).toBe(false);
    });

    it('should not reserve an existing reference', async () => {
      await finriff.reserve('CUSTOM2');
      const reserved = await finriff.reserve('CUSTOM2');
      expect(reserved).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should calculate possible combinations', () => {
      const combinations = finriff.calculatePossibleCombinations(6);
      expect(combinations).toBe(Math.pow(SAFE_CHARSET.length, 6));
    });

    it('should estimate collision probability', () => {
      const probability = finriff.estimateCollisionProbability(1000, 6);
      expect(probability).toBeGreaterThan(0);
      expect(probability).toBeLessThan(1);
    });

    it('should clear all references', async () => {
      await finriff.generate();
      await finriff.generate();
      expect(await finriff.size()).toBeGreaterThan(0);
      await finriff.clear();
      expect(await finriff.size()).toBe(0);
    });

    it('should return correct size', async () => {
      expect(await finriff.size()).toBe(0);
      await finriff.generate();
      expect(await finriff.size()).toBe(1);
      await finriff.generate();
      expect(await finriff.size()).toBe(2);
    });
  });
});