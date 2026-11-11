import config from '@/config';
import { TutorialPlayer } from './TutorialPlayer';
import { clock, isoDuration, tutorial, TUTORIALS_PLAYLIST, twoDigits } from './tutorials';

const BASE = config.metadata.metadataBase.toString().replace(/\/$/, '');

interface TutorialProps {
  /** The film's number in the series, as in `tutorials.ts`. */
  n: number;
}

/**
 * One Netfox Tutorial in a docs page, in the section that covers what it does.
 *
 * A server component: the caption, the link to the series and the VideoObject
 * are in the served HTML, for a crawler and for a reader without scripts. Only
 * the frame is a client component (`TutorialPlayer`), and it loads nothing from
 * YouTube until the reader asks for the film. Its styles are global
 * (`.nf-tutorial` in `app/global.css`), as `MascotNote`'s are: a CSS module
 * reached through `mdx-components.ts` can put one more render-blocking
 * stylesheet on every page.
 */
export function Tutorial({ n }: TutorialProps) {
  const film = tutorial(n);
  const number = twoDigits(film.n);
  const poster = `/tutorials/netfox-tutorial-${number}.jpg`;

  // https://developers.google.com/search/docs/appearance/structured-data/video
  const videoObject = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: `${film.title} | Netfox Tutorial ${number}`,
    description: film.summary,
    thumbnailUrl: `${BASE}${poster}`,
    uploadDate: film.published,
    duration: isoDuration(film.seconds),
    embedUrl: `https://www.youtube-nocookie.com/embed/${film.id}`,
    url: `https://www.youtube.com/watch?v=${film.id}`,
    inLanguage: 'en',
    publisher: { '@id': `${BASE}/#org` },
  };

  return (
    <figure className="nf-tutorial">
      <TutorialPlayer
        id={film.id}
        poster={poster}
        name={`Netfox Tutorial ${number}: ${film.title} (${clock(film.seconds)})`}
      />
      <figcaption>
        {`Netfox Tutorial ${number} · ${film.title} · ${clock(film.seconds)} · `}
        <a href={TUTORIALS_PLAYLIST}>All the tutorials</a>
      </figcaption>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObject) }}
      />
    </figure>
  );
}
