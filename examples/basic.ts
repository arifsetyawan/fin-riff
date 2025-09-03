import { exit } from 'process';
import { FinRiff } from '../src';

async function basicExample() {
  console.log('=== Basic FinRiff Example ===\n');

  // Create instance with default settings
  const finriff = new FinRiff();

  // Generate single reference
  const ref1 = await finriff.generate();
  console.log('Generated reference:', ref1);

  // Generate with custom length
  const ref2 = await finriff.generate(8);
  console.log('8-character reference:', ref2);

  // Generate batch
  const batch = await finriff.generateBatch(5);
  console.log('\nBatch of 5 references:');
  batch.forEach((ref, i) => console.log(`  ${i + 1}. ${ref}`));

  // Check uniqueness
  const isUnique = await finriff.isUnique(ref1);
  console.log(`\nIs "${ref1}" unique?`, isUnique);

  // Check statistics
  const size = await finriff.size();
  console.log('Total references stored:', size);

  const combinations = finriff.calculatePossibleCombinations();
  console.log('Possible 6-char combinations:', combinations.toLocaleString());

  const probability = finriff.estimateCollisionProbability(size);
  console.log('Current collision probability:', (probability * 100).toFixed(6) + '%');

  return
}

basicExample().then(() => { process.exit() }).catch(console.error);