import { describe, expect, test } from 'vitest';
import { t } from './t';

describe('t', () => {
  test('returns the English string for a key', () => {
    expect(t('nav.services')).toBe('Services');
  });

  test('fills placeholders', () => {
    expect(t('meta.lastVerified', { date: 'Oct 2, 2026' })).toBe('Last verified Oct 2, 2026');
  });

  test('fills numeric placeholders', () => {
    expect(t('services.count', { count: 3 })).toBe('3 services');
  });

  test('leaves unknown placeholders untouched', () => {
    expect(t('meta.lastVerified')).toBe('Last verified {date}');
  });
});
