// Checks every external source URL in the content. Writes source-report.md when any are broken.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const CONTENT_DIR = 'src/content';
const USER_AGENT =
  'BetterValenzuelaSourceCheck/1.0 (+https://github.com/JeremyDFabian/bettervalenzuela)';

function dataOf(path, text) {
  if (!path.endsWith('.md')) return parse(text);
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? parse(match[1]) : null;
}

const urls = new Map();
function add(url, file) {
  if (typeof url !== 'string') return;
  if (!urls.has(url)) urls.set(url, new Set());
  urls.get(url).add(file);
}

for (const entry of readdirSync(CONTENT_DIR, { recursive: true })) {
  const path = join(CONTENT_DIR, String(entry));
  if (!/\.(ya?ml|md)$/.test(path)) continue;
  const data = dataOf(path, readFileSync(path, 'utf8'));
  const file = path.replaceAll('\\', '/');
  for (const source of data?.sources ?? []) add(source.url, file);
  add(data?.officialLink, file);
}

async function problemWith(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(15_000),
        headers: { 'user-agent': USER_AGENT },
      });
      if (response.ok) return null;
      if (method === 'HEAD' && [403, 405, 501].includes(response.status)) continue;
      return `HTTP ${response.status}`;
    } catch (error) {
      if (method === 'HEAD') continue;
      return error.name === 'TimeoutError' ? 'timed out' : 'network error';
    }
  }
  return 'unreachable';
}

const broken = [];
for (const [url, files] of urls) {
  const problem = await problemWith(url);
  if (problem) broken.push({ url, problem, files: [...files] });
}

console.log(`Checked ${urls.size} URLs, ${broken.length} broken.`);
if (broken.length > 0) {
  const rows = broken.map((b) => `| ${b.url} | ${b.problem} | ${b.files.join('<br>')} |`);
  writeFileSync(
    'source-report.md',
    [
      'The weekly check found source links that no longer work. Replace or re-verify them.',
      '',
      '| URL | Problem | Used in |',
      '|---|---|---|',
      ...rows,
      '',
    ].join('\n'),
  );
}
