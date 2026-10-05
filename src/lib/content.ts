import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished } from './drafts';

type VerifiableCollection =
  'offices' | 'services' | 'hotlines' | 'officials' | 'barangays' | 'history';

/** Entries that may appear in this build: verified ones, plus needs-review ones when drafts are shown. */
export function getPublished<C extends VerifiableCollection>(
  collection: C,
): Promise<CollectionEntry<C>[]> {
  return getCollection(collection, (entry: CollectionEntry<C>) => isPublished(entry.data.status));
}

export function byTitle(a: { data: { title: string } }, b: { data: { title: string } }): number {
  return a.data.title.localeCompare(b.data.title, 'en');
}
