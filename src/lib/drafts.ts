export type Status = 'verified' | 'needs-review';

/** True when needs-review entries should render (dev and PR previews). */
export function showDrafts(
  value: string | undefined = import.meta.env.PUBLIC_SHOW_DRAFTS,
): boolean {
  return value === 'true';
}

export function isPublished(status: Status, drafts: boolean = showDrafts()): boolean {
  return status === 'verified' || drafts;
}

/** Returns the entry if it may be shown in this build, otherwise null. */
export function publishedOrNull<T extends { data: { status: Status } }>(
  entry: T | undefined,
  drafts: boolean = showDrafts(),
): T | null {
  return entry !== undefined && isPublished(entry.data.status, drafts) ? entry : null;
}
