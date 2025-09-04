# FinRiff

A TypeScript library for generating financial-safe reference codes with built-in persistence support to avoid duplicates.

## 🛟 Support me to keep crafting 
[![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/arifsetyawan) 

<!-- Proudly created with GPRM ( https://gprm.itsvg.in ) -->

## Features

- **Financial-Safe Character Set**: Uses `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` by default, avoiding similar-looking characters (1, I, i, l, 0, O, o)
- **Cryptographically Secure**: Uses Node.js crypto module for random generation
- **Configurable Length**: Default 6 characters, customizable up to 12
- **Duplicate Prevention**: Built-in persistence layer to avoid generating duplicate references
- **TTL Support**: Automatic expiration of references (default 24 hours)
- **Multiple Adapters**: In-memory (default) and Redis persistence options
- **TypeScript First**: Full type safety and IntelliSense support

## Installation

```bash
pnpm add fin-riff
# or
npm install fin-riff
# or
yarn add fin-riff
```

## Quick Start

```typescript
import { FinRiff } from 'fin-riff';

const finriff = new FinRiff();

// Generate a 6-character reference
const reference = await finriff.generate();
console.log(reference); // e.g., "A3K9P2"

// Generate with custom length
const longRef = await finriff.generate(10);
console.log(longRef); // e.g., "B4N7X2M9Q5"

// Generate multiple references
const batch = await finriff.generateBatch(5);
console.log(batch); // Array of 5 unique references
```

## Configuration Options

```typescript
import { FinRiff, MemoryAdapter, RedisAdapter } from 'fin-riff';

// Default configuration
const finriff = new FinRiff({
  length: 6,                          // Default reference length
  ttl: 24 * 60 * 60 * 1000,         // 24 hours in milliseconds
  charset: '23456789ABCDEFGHJKLMNPQRSTUVWXYZ', // Safe charset
  adapter: new MemoryAdapter()       // In-memory persistence
});
```

## Persistence Adapters

### In-Memory Adapter (Default)

```typescript
import { FinRiff, MemoryAdapter } from 'fin-riff';

const adapter = new MemoryAdapter(60000); // Cleanup interval in ms
const finriff = new FinRiff({ adapter });
```

### Redis Adapter

```typescript
import { FinRiff, RedisAdapter } from 'fin-riff';
import Redis from 'ioredis';

// Option 1: Pass existing Redis client
const redis = new Redis();
const adapter = new RedisAdapter({ 
  client: redis,
  prefix: 'finriff:' 
});

// Option 2: Let adapter create client
const adapter = new RedisAdapter({
  host: 'localhost',
  port: 6379,
  password: 'your-password',
  db: 0,
  clientType: 'ioredis', // or 'redis'
  prefix: 'finriff:'
});

const finriff = new FinRiff({ adapter });
```

## API Reference

### `FinRiff`

#### `constructor(options?: FinRiffOptions)`
Creates a new FinRiff instance.

#### `generate(length?: number): Promise<string>`
Generates a unique reference code.

#### `generateBatch(count: number, length?: number): Promise<string[]>`
Generates multiple unique reference codes.

#### `isUnique(reference: string): Promise<boolean>`
Checks if a reference is unique (not in persistence).

#### `reserve(reference: string, ttl?: number): Promise<boolean>`
Reserves a custom reference if available.

#### `clear(): Promise<void>`
Clears all stored references.

#### `size(): Promise<number>`
Returns the count of stored references.

#### `calculatePossibleCombinations(length?: number): number`
Calculates total possible combinations for given length.

#### `estimateCollisionProbability(existingCount: number, length?: number): number`
Estimates the probability of collision based on existing references.

## Advanced Usage

### Custom Character Set

```typescript
const finriff = new FinRiff({
  charset: 'ABCDEF123456', // Hexadecimal-like
  length: 8
});
```

### Collision Monitoring

```typescript
const finriff = new FinRiff();

// Check how many references exist
const count = await finriff.size();

// Calculate collision probability
const probability = finriff.estimateCollisionProbability(count, 6);
console.log(`Collision probability: ${(probability * 100).toFixed(4)}%`);

// Total possible combinations
const combinations = finriff.calculatePossibleCombinations(6);
console.log(`Total combinations: ${combinations.toLocaleString()}`);
```

### Custom Reference Reservation

```typescript
const finriff = new FinRiff();

// Try to reserve a specific reference
const reserved = await finriff.reserve('CUSTOM1');
if (reserved) {
  console.log('Reference reserved successfully');
} else {
  console.log('Reference already exists');
}
```

## Character Set Design

The default character set `2356789BCDEFGHJKLMNPQRSTUVWXYZ` excludes:
- `0` and `O` (zero and letter O)
- `1`, `I`, and `l` (one, capital i, lowercase L)
- `A` and `4`

This ensures references are unambiguous when read by customers or entered manually.

## Performance Considerations

- **6 characters**: 729,000,000 possible combinations
- **8 characters**: 656,100,000,000 combinations (~656 billion)
- **10 characters**: 590,490,000,000,000 combinations (~590 trillion)
- **12 characters**: 531,441,000,000,000,000 combinations (~531 quadrillion)

## Testing

```bash
pnpm test           # Run tests
pnpm test:ui        # Run tests with UI
pnpm test:coverage  # Generate coverage report
```

## Building

```bash
pnpm build  # Compile TypeScript
pnpm dev    # Watch mode
```

## License

MIT
