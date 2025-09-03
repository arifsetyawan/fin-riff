import { FinRiff, PersistenceAdapter } from '../src';

// Custom persistence adapter example
class CustomAdapter implements PersistenceAdapter {
  private storage = new Map<string, number>();

  async has(key: string): Promise<boolean> {
    const expiry = this.storage.get(key);
    if (!expiry) return false;
    
    if (Date.now() > expiry) {
      this.storage.delete(key);
      return false;
    }
    return true;
  }

  async set(key: string, ttlMs: number): Promise<void> {
    this.storage.set(key, Date.now() + ttlMs);
    console.log(`  [CustomAdapter] Stored: ${key}`);
  }

  async clear(): Promise<void> {
    this.storage.clear();
    console.log('  [CustomAdapter] Cleared all entries');
  }

  async size(): Promise<number> {
    // Clean expired first
    const now = Date.now();
    for (const [key, expiry] of this.storage.entries()) {
      if (now > expiry) {
        this.storage.delete(key);
      }
    }
    return this.storage.size;
  }
}

async function customExample() {
  console.log('=== Custom Adapter & Charset Example ===\n');

  // Example 1: Custom adapter
  console.log('1. Using custom persistence adapter:\n');
  const customAdapter = new CustomAdapter();
  const finriff1 = new FinRiff({
    adapter: customAdapter,
    length: 6
  });

  const ref1 = await finriff1.generate();
  const ref2 = await finriff1.generate();
  console.log(`Generated: ${ref1}, ${ref2}`);
  console.log(`Size: ${await finriff1.size()}\n`);

  // Example 2: Custom charset (hexadecimal-like)
  console.log('2. Using hexadecimal charset:\n');
  const hexFinriff = new FinRiff({
    charset: '0123456789ABCDEF',
    length: 8
  });

  const hexRefs = await hexFinriff.generateBatch(3);
  console.log('Hex-like references:');
  hexRefs.forEach(ref => console.log(`  ${ref}`));

  // Example 3: Custom charset (letters only)
  console.log('\n3. Using letters-only charset:\n');
  const letterFinriff = new FinRiff({
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    length: 5
  });

  const letterRefs = await letterFinriff.generateBatch(3);
  console.log('Letter-only references:');
  letterRefs.forEach(ref => console.log(`  ${ref}`));

  // Example 4: Short codes for URLs
  console.log('\n4. URL-safe short codes:\n');
  const urlFinriff = new FinRiff({
    charset: 'abcdefghijklmnopqrstuvwxyz0123456789',
    length: 4,
    ttl: 5 * 60 * 1000 // 5 minutes for temporary URLs
  });

  const urlCodes = await urlFinriff.generateBatch(3);
  console.log('URL short codes:');
  urlCodes.forEach(code => console.log(`  https://example.com/${code}`));
}

customExample().catch(console.error);