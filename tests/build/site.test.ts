import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';

const ROOT = '.test-dist';
const PROD = join(ROOT, 'prod');
const DRAFTS = join(ROOT, 'drafts');

function build(outDir: string, showDrafts: boolean): void {
  const result = spawnSync('pnpm', ['astro', 'build'], {
    shell: true,
    encoding: 'utf8',
    env: { ...process.env, ASTRO_OUT_DIR: outDir, PUBLIC_SHOW_DRAFTS: showDrafts ? 'true' : '' },
  });
  if (result.status !== 0) {
    throw new Error(`astro build failed (${outDir}):\n${result.stdout}\n${result.stderr}`);
  }
}

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true })
    .map(String)
    .filter((file) => file.endsWith('.html'))
    .map((file) => join(dir, file));
}

function read(dir: string, path: string): string {
  return readFileSync(join(dir, path), 'utf8');
}

// An executable <script> without src= would be blocked by our CSP (script-src 'self').
const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>/;

beforeAll(() => {
  rmSync(ROOT, { recursive: true, force: true });
  build(PROD, false);
  build(DRAFTS, true);
});

describe.each([
  ['production', PROD],
  ['drafts', DRAFTS],
])('%s build: every page', (_name, dir) => {
  test('declares English, has exactly one h1, and has no inline scripts', () => {
    const files = htmlFiles(dir);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const html = readFileSync(file, 'utf8');
      expect(html, file).toMatch(/<html lang="en"/);
      expect(html.match(/<h1[\s>]/g)?.length, file).toBe(1);
      expect(html, file).not.toMatch(INLINE_SCRIPT);
    }
  });

  test('carries the unofficial disclaimer and a link to the official site', () => {
    for (const file of htmlFiles(dir)) {
      const html = readFileSync(file, 'utf8');
      expect(html, file).toContain('not affiliated with, endorsed by, or an official channel');
      expect(html, file).toContain('href="https://www.valenzuela.gov.ph/"');
    }
  });

  test('has the 404, About, Privacy, Accessibility, and Search pages', () => {
    for (const page of [
      '404.html',
      'about/index.html',
      'privacy/index.html',
      'accessibility/index.html',
      'search/index.html',
    ]) {
      expect(existsSync(join(dir, page)), page).toBe(true);
    }
  });

  test('About says BetterValenzuela is part of BetterGov.ph and links to its Join Us page', () => {
    const html = read(dir, 'about/index.html');
    expect(html).toContain('href="https://bettergov.ph/"');
    expect(html).toContain('href="https://bettergov.ph/join-us"');
  });

  test('offers 911 as a call link and a skip link on every page', () => {
    for (const file of htmlFiles(dir)) {
      const html = readFileSync(file, 'utf8');
      expect(html, file).toContain('href="tel:911"');
      expect(html, file).toContain('href="#main"');
    }
  });

  test('writes the portal name as one word', () => {
    for (const file of htmlFiles(dir)) {
      const html = readFileSync(file, 'utf8');
      expect(html, file).toMatch(/<title>[^<]*BetterValenzuela[^<]*<\/title>/);
      expect(html, file).not.toContain('Better Valenzuela');
    }
  });

  test('never links to sections that are not built yet', () => {
    const unbuilt = [
      '/government/',
      '/barangays/',
      '/ordinances/',
      '/transparency/',
      '/preparedness/',
      '/statistics/',
      '/history/',
      '/quiz/',
    ];
    for (const file of htmlFiles(dir)) {
      const html = readFileSync(file, 'utf8');
      for (const path of unbuilt) {
        expect(html, `${file} links to ${path}`).not.toContain(`href="${path}"`);
      }
    }
  });
});

describe('services listing', () => {
  test('lists every category, even with no verified services', () => {
    const html = read(PROD, 'services/index.html');
    for (const id of ['certificates', 'business', 'tax', 'environment']) {
      expect(html).toContain(`href="/services/${id}/"`);
    }
  });

  test('production category pages show the empty state instead of samples', () => {
    const html = read(PROD, 'services/business/index.html');
    expect(html).toContain('No verified services in this category yet.');
    expect(html).not.toContain('(sample)');
  });

  test('drafts category pages list the sample service', () => {
    const html = read(DRAFTS, 'services/business/index.html');
    expect(html).toContain('href="/services/business/sample-business-permit/"');
  });
});

describe('service detail page', () => {
  const page = 'services/business/sample-business-permit/index.html';

  test('is absent in production while the entry needs review', () => {
    expect(existsSync(join(PROD, page))).toBe(false);
  });

  test('renders in drafts with badge, noindex, fees, office, and structured data', () => {
    const html = read(DRAFTS, page);
    expect(html).toContain('data-review-badge');
    expect(html).toMatch(/<meta name="robots" content="noindex"\s*\/?>/);
    expect(html).toContain('₱500.00');
    expect(html).toContain('Free'); // the 0-peso fee
    expect(html).toContain('Business Permits and Licensing Office (sample)');
    expect(html).toContain('href="tel:+63283521000"');
    expect(html).toContain('"@type":"GovernmentService"');
    expect(html).toContain('Last verified');
    expect(html).toContain('Oct 2, 2026');
  });

  test('lists each requirement as a checkbox that works without JavaScript', () => {
    const html = read(DRAFTS, page);
    expect(html.match(/type="checkbox"/g)).toHaveLength(2);
  });

  test('a service with no fees says so', () => {
    expect(read(DRAFTS, 'services/certificates/sample-birth-certificate/index.html')).toContain(
      'No fees listed.',
    );
  });
});

describe('hotlines', () => {
  test('production always offers 911 even though the sample hotlines need review', () => {
    const html = read(PROD, 'hotlines/index.html');
    expect(html).toContain('href="tel:911"');
    expect(html).toContain('City hotlines are still being verified.');
    expect(html).not.toContain('(sample)');
  });

  test('drafts list hotlines by category with dialable links', () => {
    const html = read(DRAFTS, 'hotlines/index.html');
    expect(html).toContain('Fire');
    expect(html).toContain('href="tel:+63282923519"');
    expect(html).toContain('data-review-badge');
  });

  test('numbers that cannot be dialled are shown as text, never as tel: links', () => {
    const html = read(DRAFTS, 'hotlines/index.html');
    expect(html).toContain('(044) 791-0000');
    expect(html).not.toContain('tel:044');
  });
});
