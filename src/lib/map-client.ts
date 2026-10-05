import leafletCssUrl from 'leaflet/dist/leaflet.css?url';

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const COPYRIGHT_URL = 'https://www.openstreetmap.org/copyright';
const LINKED_TEXT = 'OpenStreetMap contributors';

export function readMapData(el: HTMLElement): { lat: number; lng: number; label: string } | null {
  const lat = Number(el.dataset.lat);
  const lng = Number(el.dataset.lng);
  if (!el.dataset.lat || !el.dataset.lng || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return { lat, lng, label: el.dataset.label ?? '' };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Attribution HTML: the (escaped) UI text with "OpenStreetMap contributors" linked to the OSM copyright page. */
export function buildAttribution(text: string): string {
  const safe = escapeHtml(text);
  return safe.replace(LINKED_TEXT, `<a href="${COPYRIGHT_URL}" rel="external">${LINKED_TEXT}</a>`);
}

/** Loads Leaflet's stylesheet on demand (not render-blocking); rejects if it fails. */
function loadLeafletCss(): Promise<void> {
  const existing = document.querySelector<HTMLLinkElement>(`link[href="${leafletCssUrl}"]`);
  if (existing) return existing.sheet ? Promise.resolve() : waitFor(existing);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = leafletCssUrl;
  const loaded = waitFor(link);
  document.head.append(link);
  return loaded;
}

function waitFor(link: HTMLLinkElement): Promise<void> {
  return new Promise((resolve, reject) => {
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => reject(new Error('leaflet css')), { once: true });
  });
}

async function render(el: HTMLElement): Promise<void> {
  const data = readMapData(el);
  if (!data) return;
  try {
    const [{ default: L }] = await Promise.all([import('leaflet'), loadLeafletCss()]);
    el.hidden = false;
    const map = L.map(el, { scrollWheelZoom: false, attributionControl: true }).setView(
      [data.lat, data.lng],
      17,
    );
    L.tileLayer(TILE_URL, {
      maxZoom: 19,
      attribution: buildAttribution(el.dataset.attribution ?? ''),
    }).addTo(map);
    // A vector marker: no image files to bundle or allow in the CSP.
    L.circleMarker([data.lat, data.lng], {
      radius: 9,
      weight: 3,
      color: '#fff',
      fillColor: getComputedStyle(el).getPropertyValue('--color-primary').trim(),
      fillOpacity: 1,
    }).addTo(map);
  } catch {
    el.hidden = true; // Leaflet or its CSS failed to load: the note and OSM link stay.
  }
}

/**
 * Calls onVisible with each island's [data-map] container once its (visible) wrapper nears the
 * viewport. The container itself is display:none, so it can never be observed. Idempotent.
 */
export function observeMaps(root: ParentNode, onVisible: (map: HTMLElement) => void): void {
  const islands = [...root.querySelectorAll<HTMLElement>('[data-map-island]')].filter(
    (island) => !('mapReady' in island.dataset),
  );
  const start = (island: HTMLElement): void => {
    if ('mapReady' in island.dataset) return;
    island.dataset.mapReady = '';
    const map = island.querySelector<HTMLElement>('[data-map]');
    if (map) onVisible(map);
  };
  if (!('IntersectionObserver' in window)) {
    islands.forEach(start);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        start(entry.target as HTMLElement);
      }
    },
    { rootMargin: '200px' },
  );
  islands.forEach((island) => io.observe(island));
}

/** Renders each map once its island nears the viewport (spec §6.2). */
export function initMaps(root: ParentNode = document): void {
  observeMaps(root, (el) => void render(el));
}
