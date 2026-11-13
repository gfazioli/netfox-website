/**
 * The Netfox Tutorials on the app's YouTube channel, in the playlist's order.
 *
 * A docs page shows one with `<Tutorial n={1} />`, in the section that covers
 * what the film does. The films go public one at a time (Mondays,
 * Wednesdays and Fridays at 17:00 CET until 2 December 2026); before `published` a
 * film is private, and an embed of it says "Video unavailable". So each one
 * joins its page on the day it goes out, and `Tutorial.test.tsx` refuses a
 * page that embeds one whose time has not come.
 *
 * `title` is the film's title on YouTube without the "| Netfox Tutorial NN"
 * suffix; `seconds` is the length of the delivered mp4 to a tenth, which
 * YouTube rounds two ways: its player shows 63.4 s as 1:04, its data says 63
 * (checked on film 01, 2026-11-11). So the caption rounds up, as the player
 * the reader is about to start does, and the VideoObject down; `poster` is
 * the film's thumbnail, 1280x720, in `public/tutorials/`.
 */
export interface TutorialFilm {
  n: number;
  /** The YouTube video id. */
  id: string;
  title: string;
  /** What the film shows, for the VideoObject's description. */
  summary: string;
  seconds: number;
  /** When the film went (or goes) public, with its offset. */
  published: string;
}

/**
 * The series' playlist. Its id is complete at 13 characters, shorter than the
 * 34 most playlists have: this channel's ids are that length, and YouTube's
 * oEmbed answers this one as "Netfox Tutorials" by Netfox for Mac (checked
 * 2026-11-11, after a review read it as truncated).
 */
export const TUTORIALS_PLAYLIST = 'https://www.youtube.com/playlist?list=PLW8OHY697Uys';

export const TUTORIALS: TutorialFilm[] = [
  {
    n: 1,
    id: 'rGAKkh0wSEk',
    title: 'Name unknown devices on your network',
    summary:
      'Some devices on your network never say what they are. In this first Netfox tutorial, give one a name and a kind, so your device list reads the way you think of it.',
    seconds: 63.4,
    published: '2026-11-11T11:09:00+01:00',
  },
  {
    n: 2,
    id: 'zY_1jjvYAB4',
    title: "See who's on your network and filter the list",
    summary:
      'Every row in the Devices list is one machine on your network. In this Netfox tutorial, learn what a row tells you, then narrow the list with the status filter and with search.',
    seconds: 80.1,
    published: '2026-11-13T11:55:00+01:00',
  },
  {
    n: 3,
    id: 'aDS-ToD7oFQ',
    title: 'Find hidden devices on your network',
    summary:
      'Some devices never announce themselves, so Netfox cannot hear them. In this tutorial, run a sweep from the Devices toolbar so those silent devices show up in the list.',
    seconds: 82.8,
    published: '2026-11-16T17:00:00+01:00',
  },
  {
    n: 4,
    id: '3ZM-VueoEEc',
    title: 'Inspect any device on your network',
    summary:
      'Click a device in the Devices list and its detail panel opens. In this Netfox tutorial, read what the header, the General tab and the History tab say about one device on your network.',
    seconds: 84.5,
    published: '2026-11-18T17:00:00+01:00',
  },
  {
    n: 5,
    id: 'qp39duAZnIk',
    title: 'Check which ports are open on a device',
    summary:
      "Netfox can try the common ports on one device and show which ones answer. In this Netfox tutorial, probe a printer's ports from the Devices tool, then read which are open and what the shield on a port means.",
    seconds: 84.3,
    published: '2026-11-20T17:00:00+01:00',
  },
  {
    n: 6,
    id: 'uN9FtKuoAQ4',
    title: 'Scan your home network for security risks',
    summary:
      'Netfox can check every device on your network for open services. In this tutorial, run a scan from the Security tool, then read the result by device and by service.',
    seconds: 84.0,
    published: '2026-11-23T17:00:00+01:00',
  },
  {
    n: 7,
    id: 'xEGrU8EALS8',
    title: 'Get an alert when a new device joins your network',
    summary:
      'Netfox can tell you the moment a device it has never seen joins your network. In this tutorial, see the alert, read it in the inbox, and mute the alerts for a device you trust.',
    seconds: 82.4,
    published: '2026-11-25T17:00:00+01:00',
  },
  {
    n: 8,
    id: 'TuNK9uIEgDk',
    title: "Check your network's health at a glance",
    summary:
      'The Overview is the first thing Netfox shows. In this tutorial, read it in four questions: which network you are on, whether the link is good, whether anything is being dropped, and where a delay starts.',
    seconds: 73.8,
    published: '2026-11-27T17:00:00+01:00',
  },
  {
    n: 9,
    id: 'Mwt_0yJAIHw',
    title: 'Is my Wi-Fi the problem? Find a crowded channel',
    summary:
      'When a video stalls, is the Wi-Fi to blame? In this tutorial, use the Netfox Wi-Fi tool to see the networks around you, which ones share your channel, and what Netfox says about your own.',
    seconds: 82.3,
    published: '2026-11-30T17:00:00+01:00',
  },
  {
    n: 10,
    id: '-3IqD8XVVhg',
    title: "A network monitor in your Mac's menu bar",
    summary:
      "Netfox stays in the menu bar even when its window is closed. In this tutorial, open its panel to read your network at a glance, watch your Mac's live traffic, and choose the icon you prefer.",
    seconds: 71.1,
    published: '2026-12-02T17:00:00+01:00',
  },
];

/** The film numbered `n`; a number with no film is a typo in a page, and fails the build. */
export function tutorial(n: number): TutorialFilm {
  const film = TUTORIALS.find((t) => t.n === n);
  if (!film) {
    throw new Error(`No Netfox tutorial numbered ${n}`);
  }
  return film;
}

/** `01`, as the films and their posters are numbered. */
export const twoDigits = (n: number) => String(n).padStart(2, '0');

/** `1:04` for 63.4 s, as YouTube's player writes a length: rounded up. */
export const clock = (seconds: number) => {
  const whole = Math.ceil(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

/** `PT1M3S` for 63.4 s, as schema.org wants a length and YouTube's data gives it: rounded down. */
export const isoDuration = (seconds: number) => {
  const whole = Math.floor(seconds);
  return `PT${Math.floor(whole / 60)}M${whole % 60}S`;
};
