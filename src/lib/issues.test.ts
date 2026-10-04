import { describe, expect, test } from 'vitest';
import { buildIssueUrl } from './issues';

const REPO = 'https://github.com/JeremyDFabian/bettervalenzuela';

describe('buildIssueUrl', () => {
  test('opens the report-error form with the page title and URL', () => {
    const url = new URL(
      buildIssueUrl(REPO, {
        title: 'Business permit',
        url: 'https://x.dev/services/business/permit/',
      }),
    );
    expect(url.origin + url.pathname).toBe(`${REPO}/issues/new`);
    expect(url.searchParams.get('template')).toBe('report-error.yml');
    expect(url.searchParams.get('title')).toBe('Error on: Business permit');
    expect(url.searchParams.get('page-url')).toBe('https://x.dev/services/business/permit/');
  });

  test('tolerates a trailing slash on the repo URL', () => {
    expect(buildIssueUrl(`${REPO}/`, { title: 'A', url: 'https://x.dev/' })).toContain(
      `${REPO}/issues/new?`,
    );
  });

  test('encodes characters that would break the query string', () => {
    const url = new URL(
      buildIssueUrl(REPO, { title: 'Fees & taxes #2 ₱?', url: 'https://x.dev/?a=1&b=2' }),
    );
    expect(url.searchParams.get('title')).toBe('Error on: Fees & taxes #2 ₱?');
    expect(url.searchParams.get('page-url')).toBe('https://x.dev/?a=1&b=2');
  });

  test('truncates very long titles', () => {
    const url = new URL(buildIssueUrl(REPO, { title: 'x'.repeat(500), url: 'https://x.dev/' }));
    const title = url.searchParams.get('title') ?? '';
    expect(title.length).toBeLessThanOrEqual('Error on: '.length + 120);
    expect(title.endsWith('…')).toBe(true);
  });
});
