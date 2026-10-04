import type { Source } from './types';

export interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  featured: boolean;
  sources: Source[];
}

export function sortedTimeline(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => a.year - b.year);
}

/** Events marked featured, oldest first, for the home teaser. */
export function featuredEvents(events: TimelineEvent[], limit = 3): TimelineEvent[] {
  return sortedTimeline(events.filter((e) => e.featured)).slice(0, limit);
}
