import { formatReleaseDate } from './format-release-date';

// The suite runs in Pacific/Auckland (pinned in jest.global-setup.cjs, since a
// beforeAll is too late to affect Intl). That zone is ahead of UTC, so the first
// case below renders "July 31, 2026" without the UTC pin and this file goes red.
// Under UTC — or under Europe/Rome, which agrees with UTC for these timestamps —
// it would pass either way and prove nothing.
describe('formatReleaseDate', () => {
  it('keeps an evening-UTC publication on its own calendar date', () => {
    // v0.15.0, published 18:03 UTC, which is already 31 July local in Auckland.
    expect(formatReleaseDate('2026-07-30T18:03:22Z', '2026-07-30T07:46:45Z')).toBe('July 30, 2026');
  });

  it('dates a release by publication, not by the commit its tag points at', () => {
    // v0.16.6: tagged on the previous release's commit (5 August), shipped 20 August.
    expect(formatReleaseDate('2026-08-20T11:21:23Z', '2026-08-05T11:58:34Z')).toBe(
      'August 20, 2026'
    );
  });

  it('falls back to the created date for a draft, which has no publication date', () => {
    expect(formatReleaseDate(null, '2026-08-05T11:58:34Z')).toBe('August 5, 2026');
  });
});
