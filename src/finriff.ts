import { FinRiffOptions, PersistenceAdapter, DuplicateReferenceError } from './types';
import { MemoryAdapter } from './adapters/memory';
import { SAFE_CHARSET, validateCharset, generateCryptoRandomString } from './utils/charset';

export class FinRiff {
  private charset: string;
  private defaultLength: number;
  private maxLength: number = 12;
  private minLength: number = 1;
  private ttl: number;
  private adapter: PersistenceAdapter;
  private maxRetries: number = 100;

  constructor(options: FinRiffOptions = {}) {
    this.charset = options.charset || SAFE_CHARSET;

    if (!validateCharset(this.charset)) {
      throw new Error('Invalid charset: must contain at least 2 unique characters');
    }

    this.defaultLength = options.length !== undefined ? options.length : 6;

    if (this.defaultLength < this.minLength || this.defaultLength > this.maxLength) {
      throw new Error(`Length must be between ${this.minLength} and ${this.maxLength}`);
    }

    this.ttl = options.ttl || 24 * 60 * 60 * 1000;
    this.adapter = options.adapter || new MemoryAdapter();
  }

  async generate(length?: number): Promise<string> {
    const targetLength = length || this.defaultLength;

    if (targetLength < this.minLength || targetLength > this.maxLength) {
      throw new Error(`Length must be between ${this.minLength} and ${this.maxLength}`);
    }

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const reference = generateCryptoRandomString(this.charset, targetLength);

      if (!(await this.adapter.has(reference))) {
        await this.adapter.set(reference, this.ttl);
        return reference;
      }
    }

    throw new DuplicateReferenceError(
      `Failed to generate unique reference after ${this.maxRetries} attempts`
    );
  }

  async generateBatch(count: number, length?: number): Promise<string[]> {
    const results: string[] = [];

    for (let i = 0; i < count; i++) {
      results.push(await this.generate(length));
    }

    return results;
  }

  async isUnique(reference: string): Promise<boolean> {
    return !(await this.adapter.has(reference));
  }

  async reserve(reference: string, ttl?: number): Promise<boolean> {
    if (await this.adapter.has(reference)) {
      return false;
    }

    await this.adapter.set(reference, ttl || this.ttl);
    return true;
  }

  async clear(): Promise<void> {
    await this.adapter.clear();
  }

  async size(): Promise<number> {
    return await this.adapter.size();
  }

  getCharset(): string {
    return this.charset;
  }

  getDefaultLength(): number {
    return this.defaultLength;
  }

  getTTL(): number {
    return this.ttl;
  }

  calculatePossibleCombinations(length?: number): number {
    const targetLength = length || this.defaultLength;
    return Math.pow(this.charset.length, targetLength);
  }

  estimateCollisionProbability(existingCount: number, length?: number): number {
    const totalCombinations = this.calculatePossibleCombinations(length);
    return existingCount / totalCombinations;
  }
}