import { describe, expect, test } from 'vitest';
import { totalFee } from './fees';

describe('totalFee', () => {
  test('is 0 when no fees are listed', () => {
    expect(totalFee([])).toBe(0);
  });

  test('adds every fee amount', () => {
    expect(totalFee([{ amount: 500 }, { amount: 0 }, { amount: 125.5 }])).toBe(625.5);
  });
});
