'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import NextImage from 'next/image';
import { docsSizes } from '@/components/DocsImage/DocsImage';

interface TutorialPlayerProps {
  /** The YouTube video id. */
  id: string;
  /** The film's thumbnail, in `public/`. */
  poster: string;
  /** The film's number, title and length: the player's title, and the poster link says Play it. */
  name: string;
}

/**
 * The film's frame: its poster with a Play control until the reader asks for
 * it, then YouTube's player in its place, already playing.
 *
 * Nothing from YouTube loads before that click: no script, no cookie, no
 * request, so a docs page costs what it did and tells YouTube nothing about
 * who read it. The player comes from youtube-nocookie.com, which sets no
 * cookie until the film plays.
 *
 * The poster is a link to the film on YouTube, so without scripts, or with a
 * modifier held (a new tab, a new window), the reader gets the film there.
 * Its words are the image's `alt`, which is the link's name for a screen
 * reader and for the link-text audit; the Play pill says it to the eye.
 *
 * Focus moves into the player once it is there, so the keyboard reader who
 * pressed Return is not left on a control that has gone. `referrerPolicy`
 * keeps the origin YouTube now requires of an embed (it refuses one without,
 * "Error 153").
 */
export function TutorialPlayer({ id, poster, name }: TutorialPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (playing) {
      frame.current?.focus();
    }
  }, [playing]);

  const play = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return; // the browser opens YouTube, as the reader asked
    }
    event.preventDefault();
    setPlaying(true);
  };

  return (
    <div className="nf-tutorial-frame">
      {playing ? (
        <iframe
          ref={frame}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={name}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <a
          className="nf-tutorial-poster"
          href={`https://www.youtube.com/watch?v=${id}`}
          onClick={play}
        >
          <NextImage src={poster} alt={`Play ${name}`} fill sizes={docsSizes()} loading="lazy" />
          <span className="nf-tutorial-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
            Play
          </span>
        </a>
      )}
    </div>
  );
}
