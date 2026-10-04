/**
 * Astro's reference() only reshapes the value; it does not check that the entry exists.
 * Pages call this after getEntry() so a typo fails the build, naming the file and field
 * (spec §5.2, §9), instead of shipping a placeholder.
 */
export function requireEntry<T>(
  entry: T | undefined,
  ref: { from: string; field: string; id: string },
): T {
  if (entry === undefined) {
    throw new Error(`${ref.from}: ${ref.field} "${ref.id}" does not exist`);
  }
  return entry;
}
