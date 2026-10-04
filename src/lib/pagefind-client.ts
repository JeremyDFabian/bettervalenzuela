/** Browser-only helpers around Pagefind's JavaScript API (the index is built after `astro build`). */

export interface SearchHit {
  url: string;
  title: string;
  /** Pagefind excerpt HTML: our own indexed text with <mark> around matches. */
  excerpt: string;
  section: string;
}

interface PagefindResultData {
  url: string;
  excerpt: string;
  meta: { title?: string };
  filters: Record<string, string[]>;
}

interface PagefindModule {
  init?: () => Promise<void>;
  search: (
    query: string,
  ) => Promise<{ results: { data: () => Promise<PagefindResultData> }[] } | null>;
}

let modulePromise: Promise<PagefindModule | null> | undefined;

/** Loads /pagefind/pagefind.js once. Resolves to null when search assets are missing (dev server, failed load). */
export function loadPagefind(): Promise<PagefindModule | null> {
  modulePromise ??= (async () => {
    try {
      const url = '/pagefind/pagefind.js';
      const pagefind = (await import(/* @vite-ignore */ url)) as PagefindModule;
      await pagefind.init?.();
      return pagefind;
    } catch {
      return null;
    }
  })();
  return modulePromise;
}

/** Runs a search and returns up to `limit` hits, or null when search is unavailable. */
export async function searchSite(
  query: string,
  limit = Infinity,
): Promise<{ total: number; hits: SearchHit[] } | null> {
  const pagefind = await loadPagefind();
  if (!pagefind) return null;
  const response = await pagefind.search(query);
  if (!response) return { total: 0, hits: [] };
  const slice = response.results.slice(0, limit);
  const data = await Promise.all(slice.map((r) => r.data()));
  return {
    total: response.results.length,
    hits: data.map((d) => ({
      url: d.url,
      title: d.meta.title ?? d.url,
      excerpt: d.excerpt,
      section: d.filters['section']?.[0] ?? '',
    })),
  };
}
