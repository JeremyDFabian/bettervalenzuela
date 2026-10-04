// Warns (never fails) about entries whose lastVerified is older than 12 months (spec §8).
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const CONTENT_DIR = 'src/content';
const MAX_AGE_DAYS = 365;
const DAY_MS = 86_400_000;

function dataOf(path, text) {
  if (!path.endsWith('.md')) return parse(text);
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? parse(match[1]) : null;
}

let stale = 0;
for (const entry of readdirSync(CONTENT_DIR, { recursive: true })) {
  const path = join(CONTENT_DIR, String(entry));
  if (!/\.(ya?ml|md)$/.test(path)) continue;
  const data = dataOf(path, readFileSync(path, 'utf8'));
  if (!data?.lastVerified) continue;
  const ageDays = Math.floor((Date.now() - new Date(data.lastVerified).getTime()) / DAY_MS);
  if (ageDays > MAX_AGE_DAYS) {
    stale += 1;
    const file = path.replaceAll('\\', '/');
    console.log(
      `::warning file=${file}::lastVerified is ${ageDays} days old (limit ${MAX_AGE_DAYS})`,
    );
  }
}
console.log(stale === 0 ? 'No stale content.' : `${stale} stale entries found.`);
