import { describe, expect, test } from 'vitest';
import { isPublished, publishedOrNull, showDrafts } from './drafts';

describe('showDrafts', () => {
  test('is true only for the exact string "true"', () => {
    expect(showDrafts('true')).toBe(true);
    expect(showDrafts('')).toBe(false);
    expect(showDrafts('1')).toBe(false);
    expect(showDrafts('TRUE')).toBe(false);
    expect(showDrafts(undefined)).toBe(false);
  });
});

describe('isPublished', () => {
  test('verified entries are always published', () => {
    expect(isPublished('verified', false)).toBe(true);
    expect(isPublished('verified', true)).toBe(true);
  });

  test('needs-review entries are published only when drafts are shown', () => {
    expect(isPublished('needs-review', false)).toBe(false);
    expect(isPublished('needs-review', true)).toBe(true);
  });
});

describe('publishedOrNull', () => {
  const verified = { id: 'a', data: { status: 'verified' as const } };
  const draft = { id: 'b', data: { status: 'needs-review' as const } };

  test('returns verified entries', () => {
    expect(publishedOrNull(verified, false)).toBe(verified);
  });

  test('hides a needs-review entry in production, e.g. a verified service pointing at an unverified office', () => {
    expect(publishedOrNull(draft, false)).toBeNull();
  });

  test('shows a needs-review entry when drafts are shown', () => {
    expect(publishedOrNull(draft, true)).toBe(draft);
  });

  test('returns null for a missing entry', () => {
    expect(publishedOrNull(undefined, true)).toBeNull();
  });
});
