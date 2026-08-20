/**
 * The calendar date to show for a release.
 *
 * Two decisions, both of which cost a wrong date on the live site:
 *
 * - `publishedAt`, never `createdAt`. GitHub reports `created_at` as the date of
 *   the commit the tag points at, and the release script creates the GitHub
 *   Release *before* it commits the appcast and config — so the tag lands on the
 *   previous release's commit and `created_at` carries that release's date.
 *   v0.16.6 shipped on 20 August and the timeline dated it 5 August, as did every
 *   0.16.x before it. `createdAt` stays as the fallback because a draft release
 *   has no `published_at`.
 * - Pinned to UTC. This is the calendar date of an event, not a local clock
 *   reading, so it must not move with whoever is reading it: v0.15.0 was
 *   published 18:03 UTC and renders as 31 July in New Zealand without this.
 */
export function formatReleaseDate(publishedAt: string | null, createdAt: string): string {
  return new Date(publishedAt ?? createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
