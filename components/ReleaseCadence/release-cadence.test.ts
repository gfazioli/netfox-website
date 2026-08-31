import config from '@/config';
import {
  fallbackReleaseCadence,
  formatFreshness,
  formatSince,
  summariseReleases,
  toCadence,
} from './release-cadence';

// The suite runs in Pacific/Auckland (pinned in jest.global-setup.cjs), i.e.
// 12-13 hours AHEAD of UTC. Several cases below only discriminate because of
// that: under Europe/Rome they would pass against a version of the code that
// counted local days, which is the bug they exist to catch.

describe('formatFreshness', () => {
  it('counts days on the UTC calendar, not the reader is own', () => {
    // Published 23:00 UTC on 31 August, read 01:00 UTC on 1 September: one UTC
    // day apart. In Auckland BOTH instants fall on 1 September, so a local-day
    // count returns "Updated today" and this assertion goes red.
    expect(formatFreshness('2026-08-31T23:00:00Z', new Date('2026-09-01T01:00:00Z'))).toBe(
      'Updated yesterday'
    );
  });

  it('reads the same UTC day as today', () => {
    expect(formatFreshness('2026-08-31T06:00:00Z', new Date('2026-08-31T22:00:00Z'))).toBe(
      'Updated today'
    );
  });

  it('counts plain days below a week', () => {
    expect(formatFreshness('2026-08-28T10:00:00Z', new Date('2026-08-31T10:00:00Z'))).toBe(
      'Updated 3 days ago'
    );
  });

  it('collapses the first full week into a phrase rather than a 7', () => {
    expect(formatFreshness('2026-08-24T10:00:00Z', new Date('2026-08-31T10:00:00Z'))).toBe(
      'Updated last week'
    );
    expect(formatFreshness('2026-08-18T10:00:00Z', new Date('2026-08-31T10:00:00Z'))).toBe(
      'Updated last week'
    );
  });

  it('counts whole weeks after that', () => {
    expect(formatFreshness('2026-08-10T10:00:00Z', new Date('2026-08-31T10:00:00Z'))).toBe(
      'Updated 3 weeks ago'
    );
  });

  it('stops selling freshness once the gap is two months', () => {
    // 59 days still reads as a cadence; 60 is where the caller falls back to
    // the plain date instead of advertising the gap on the homepage.
    expect(formatFreshness('2026-07-03T10:00:00Z', new Date('2026-08-31T10:00:00Z'))).toBe(
      'Updated 8 weeks ago'
    );
    expect(formatFreshness('2026-07-02T10:00:00Z', new Date('2026-08-31T10:00:00Z'))).toBeNull();
  });

  it('clamps a release dated in the future instead of counting backwards', () => {
    expect(formatFreshness('2026-09-02T10:00:00Z', new Date('2026-08-31T10:00:00Z'))).toBe(
      'Updated today'
    );
  });

  it('says nothing at all for an unparseable date', () => {
    expect(formatFreshness('not a date', new Date('2026-08-31T10:00:00Z'))).toBeNull();
  });
});

describe('formatSince', () => {
  it('keeps a late-evening UTC publication in its own month', () => {
    // 23:00 UTC on 31 May is already 1 June in Auckland, which would print
    // "June 2026" and postdate the app is first release by a month.
    expect(formatSince('2026-05-31T23:00:00Z')).toBe('May 2026');
  });

  it('returns nothing for an unparseable date', () => {
    expect(formatSince('')).toBeNull();
  });
});

describe('summariseReleases', () => {
  const prefix = config.releaseNotes.appReleaseNamePrefix;

  it('ignores the website template is own releases', () => {
    // The app releases share this repo with the Mantine/Nextra template, which
    // tags a v6.x release of its own whenever its packages are bumped. Counting
    // those inflates the number the homepage claims.
    const summary = summariseReleases(
      [
        { name: 'Netfox 0.17.1', published_at: '2026-08-28T11:23:59Z' },
        { name: 'v6.0.7', published_at: '2026-08-27T09:00:00Z' },
        { name: 'Netfox 0.17.0', published_at: '2026-08-27T08:25:01Z' },
      ],
      prefix
    );
    expect(summary).toEqual({
      total: 2,
      firstISO: '2026-08-27T08:25:01Z',
      latestISO: '2026-08-28T11:23:59Z',
    });
  });

  it('does not count a draft nobody can download', () => {
    const summary = summariseReleases(
      [
        {
          name: 'Netfox 0.18.0',
          draft: true,
          published_at: null,
          created_at: '2026-08-29T08:00:00Z',
        },
        { name: 'Netfox 0.17.1', published_at: '2026-08-28T11:23:59Z' },
      ],
      prefix
    );
    expect(summary?.total).toBe(1);
    expect(summary?.latestISO).toBe('2026-08-28T11:23:59Z');
  });

  it('finds the endpoints in a payload that is not in order', () => {
    const summary = summariseReleases(
      [
        { name: 'Netfox 0.14.0', published_at: '2026-07-30T07:46:41Z' },
        { name: 'Netfox 0.17.1', published_at: '2026-08-28T11:23:59Z' },
        { name: 'Netfox 0.1.0', published_at: '2026-05-17T11:52:21Z' },
      ],
      prefix
    );
    expect(summary?.firstISO).toBe('2026-05-17T11:52:21Z');
    expect(summary?.latestISO).toBe('2026-08-28T11:23:59Z');
  });

  it('dates a release by publication, not by the commit its tag points at', () => {
    // Same trap format-release-date.ts documents: release.sh creates the GitHub
    // Release before it commits the appcast, so created_at is usually the
    // PREVIOUS release is commit. Real numbers from 0.16.6, where the two are
    // FIFTEEN days apart, so dating it by created_at would place it before
    // four releases that actually shipped earlier.
    const summary = summariseReleases(
      [
        {
          name: 'Netfox 0.16.6',
          published_at: '2026-08-20T11:21:23Z',
          created_at: '2026-08-05T11:58:34Z',
        },
      ],
      prefix
    );
    expect(summary?.latestISO).toBe('2026-08-20T11:21:23Z');
  });

  it('reports nothing rather than zero when the payload matches nothing', () => {
    // A zero would render "0 releases since ...", which says the app has never
    // shipped. Null makes the strip drop the count line entirely.
    expect(
      summariseReleases([{ name: 'v6.0.7', published_at: '2026-08-27T09:00:00Z' }], prefix)
    ).toBeNull();
    expect(summariseReleases([], prefix)).toBeNull();
  });
});

describe('toCadence', () => {
  it('formats the strip is four strings off one summary', () => {
    expect(
      toCadence(
        { total: 42, firstISO: '2026-05-17T11:52:21Z', latestISO: '2026-08-28T11:23:59Z' },
        new Date('2026-08-28T18:00:00Z')
      )
    ).toEqual({
      freshness: 'Updated today',
      latestDate: 'August 28, 2026',
      total: 42,
      since: 'May 2026',
    });
  });
});

describe('fallbackReleaseCadence', () => {
  it('takes its date from the config value release.sh writes', () => {
    // Asserted against config rather than a literal, so the test does not need
    // editing at every release - and so it stays red if the date is ever
    // hardcoded in the component instead.
    const onReleaseDay = new Date(`${config.app.releaseDate}T18:00:00Z`);
    expect(fallbackReleaseCadence(onReleaseDay).freshness).toBe('Updated today');
  });

  it('offers no count, because an undercount would be a false claim', () => {
    expect(fallbackReleaseCadence(new Date()).total).toBeNull();
    expect(fallbackReleaseCadence(new Date()).since).toBeNull();
  });
});
