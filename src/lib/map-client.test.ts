import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { COPYRIGHT_URL, TILE_URL, buildAttribution, observeMaps, readMapData } from './map-client';

test('tiles come from the OSM host the CSP allows', () => {
  expect(TILE_URL).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
});

test('readMapData parses data attributes and rejects bad numbers', () => {
  const el = {
    dataset: { lat: '14.7', lng: '120.97', label: 'Malinta' },
  } as unknown as HTMLElement;
  expect(readMapData(el)).toEqual({ lat: 14.7, lng: 120.97, label: 'Malinta' });
  const bad = { dataset: { lat: 'x', lng: '120.97', label: 'M' } } as unknown as HTMLElement;
  expect(readMapData(bad)).toBeNull();
});

test('readMapData rejects empty-string coordinates', () => {
  const el = { dataset: { lat: '', lng: '', label: 'M' } } as unknown as HTMLElement;
  expect(readMapData(el)).toBeNull();
});

test('buildAttribution escapes the text and links the OSM copyright page', () => {
  expect(buildAttribution('© OpenStreetMap contributors')).toBe(
    `© <a href="${COPYRIGHT_URL}" rel="external">OpenStreetMap contributors</a>`,
  );
  expect(COPYRIGHT_URL).toBe('https://www.openstreetmap.org/copyright');
  expect(buildAttribution('<b>&')).toBe('&lt;b&gt;&amp;');
});

describe('observeMaps', () => {
  type Cb = (entries: { isIntersecting: boolean; target: unknown }[]) => void;
  let observed: unknown[];
  let unobserved: unknown[];
  let cb: Cb;

  beforeEach(() => {
    observed = [];
    unobserved = [];
    vi.stubGlobal('window', { IntersectionObserver: true });
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: Cb) {
          cb = callback;
        }
        observe(el: unknown) {
          observed.push(el);
        }
        unobserve(el: unknown) {
          unobserved.push(el);
        }
      },
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  function fixture() {
    const hidden = { hidden: true, dataset: {} };
    const wrapper = { dataset: {}, querySelector: () => hidden };
    const root = { querySelectorAll: () => [wrapper] } as unknown as ParentNode;
    return { hidden, wrapper, root };
  }

  test('observes the visible wrapper, never the hidden container', () => {
    const { hidden, wrapper, root } = fixture();
    observeMaps(root, () => {});
    expect(observed).toEqual([wrapper]);
    expect(observed).not.toContain(hidden);
  });

  test('renders the hidden child once when the wrapper intersects', () => {
    const { hidden, wrapper, root } = fixture();
    const onVisible = vi.fn();
    observeMaps(root, onVisible);
    cb([{ isIntersecting: false, target: wrapper }]);
    expect(onVisible).not.toHaveBeenCalled();
    cb([{ isIntersecting: true, target: wrapper }]);
    cb([{ isIntersecting: true, target: wrapper }]);
    expect(onVisible).toHaveBeenCalledTimes(1);
    expect(onVisible).toHaveBeenCalledWith(hidden);
    expect(unobserved[0]).toBe(wrapper);
  });

  test('skips wrappers that are already set up', () => {
    const { wrapper, root } = fixture();
    (wrapper.dataset as Record<string, string>).mapReady = '';
    observeMaps(root, () => {});
    expect(observed).toEqual([]);
  });
});
