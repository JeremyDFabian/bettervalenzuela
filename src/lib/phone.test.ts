import { describe, expect, test } from 'vitest';
import { toTelHref } from './phone';

describe('toTelHref', () => {
  test.each([
    ['911', 'tel:911'],
    ['8888', 'tel:8888'],
    ['(02) 8352-1000', 'tel:+63283521000'],
    ['02-8352-1000', 'tel:+63283521000'],
    ['8352-1000', 'tel:+63283521000'],
    ['0917 123 4567', 'tel:+639171234567'],
    ['+63 917 123 4567', 'tel:+639171234567'],
    ['+63 2 8352 1000', 'tel:+63283521000'],
    ['(02) 8352-1000 loc. 123', 'tel:+63283521000'],
    ['8352-1000 local 45', 'tel:+63283521000'],
    ['0917-123-4567 ext 9', 'tel:+639171234567'],
  ])('%s → %s', (input, expected) => {
    expect(toTelHref(input)).toBe(expected);
  });

  test.each([
    ['352-1000'], // legacy 7-digit number: cannot be dialled reliably
    [''],
    ['call the office'],
    ['12'],
    ['+63'],
  ])('%s → null (render as plain text)', (input) => {
    expect(toTelHref(input)).toBeNull();
  });
});
