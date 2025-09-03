import { FinRiff, RedisAdapter } from '../src';
import Redis from 'ioredis';

async function redisExample() {
  console.log('=== Redis Adapter Example ===\n');

  // Create Redis client
  const redis = new Redis({
    host: 'localhost',
    port: 6379,
    // password: 'your-password',
    db: 0
  });

  // Create FinRiff with Redis adapter
  const adapter = new RedisAdapter({
    client: redis,
    prefix: 'myapp:refs:'
  });

  const finriff = new FinRiff({
    adapter,
    length: 8,
    ttl: 60 * 60 * 1000 // 1 hour
  });

  try {
    // Generate references
    console.log('Generating references with Redis persistence...\n');
    
    const ref1 = await finriff.generate();
    console.log('Reference 1:', ref1);

    const ref2 = await finriff.generate();
    console.log('Reference 2:', ref2);

    // Check persistence
    const size = await finriff.size();
    console.log('\nReferences in Redis:', size);

    // Reserve custom reference
    const customRef = 'CUSTOM99';
    const reserved = await finriff.reserve(customRef);
    console.log(`\nReserved "${customRef}":`, reserved);

    // Try to reserve again (should fail)
    const reservedAgain = await finriff.reserve(customRef);
    console.log(`Reserve "${customRef}" again:`, reservedAgain);

    // Clean up
    console.log('\nCleaning up...');
    await finriff.clear();
    console.log('References after clear:', await finriff.size());

  } finally {
    // Close Redis connection
    redis.disconnect();
  }
}

redisExample().catch(console.error);