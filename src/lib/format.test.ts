import { describe, expect, test } from 'vitest';
import { formatDate, formatPeso } from './format';

describe('formatPeso', () => {
  test('formats with the peso sign, separators, and centavos', () => {
    expect(formatPeso(1250)).toBe('₱1,250.00');
    expect(formatPeso(1234567.5)).toBe('₱1,234,567.50');
  });

  test('formats zero', () => {
    expect(formatPeso(0)).toBe('₱0.00');
  });

  test('rejects negative and non-finite amounts', () => {
    expect(() => formatPeso(-1)).toThrow(RangeError);
    expect(() => formatPeso(Number.NaN)).toThrow(RangeError);
    expect(() => formatPeso(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe('formatDate', () => {
  test('formats a YAML date-only value', () => {
    expect(formatDate(new Date('2026-10-02'))).toBe('Oct 2, 2026');
  });

  test('uses Manila time, not the build machine time zone', () => {
    // 20:00 UTC on Oct 1 is already Oct 2 in Manila (UTC+8).
    expect(formatDate(new Date('2026-10-01T20:00:00Z'))).toBe('Oct 2, 2026');
  });

  test('rejects invalid dates', () => {
    expect(() => formatDate(new Date('not a date'))).toThrow(RangeError);
  });
});
