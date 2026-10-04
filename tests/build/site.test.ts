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
