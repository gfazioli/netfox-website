/**
 * Whether something introduced in `since` still deserves a "new" marker when
 * the app is at `current`.
 *
 * Ported from findergit-website (2026-10-08), where it takes the NEW badges
 * off the feature cards: a sticker that never comes off stops meaning
 * anything. Here it decays the Discord call to action's "Just opened".
 *
 * The marker shows only while the running version is within `window` minor
 * releases of `since`. `config.app.version` is bumped by release.sh on every
 * release, which is what makes this decay on its own.
 *
 * A different major is never "recent" (0.38 → 1.0 makes the minor distance
 * meaningless), and a `since` ahead of `current` is not either: that marks
 * something the shipped app does not have yet.
 */
export function isRecent(since: string, current: string, window = 2): boolean {
  const a = parse(since);
  const b = parse(current);
  if (!a || !b) return false;
  if (a.major !== b.major) return false;
  const distance = b.minor - a.minor;
  return distance >= 0 && distance <= window;
}

function parse(version: string): { major: number; minor: number } | null {
  const m = /^(\d+)\.(\d+)(?:\.(\d+))?$/.exec(version.trim());
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]) };
}
