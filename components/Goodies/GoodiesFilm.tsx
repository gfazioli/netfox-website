'use client';

import { useEffect, useRef, useState } from 'react';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { useReducedMotion } from '@mantine/hooks';
import classes from './Goodies.module.css';

/** How much of the film must be on screen for it to play. */
const VISIBLE = 0.25;

/**
 * The pack's 30-second film, an exact loop, muted (it has no sound).
 *
 * Nothing of the film is fetched before it plays (`preload="none"`), only its
 * poster. It plays only while at least a quarter of it is on screen, so a
 * reader who scrolled past is not decoding video at rest, and never on its own
 * for a visitor who asked for reduced motion: they get the poster and the
 * browser's controls. Without scripts the poster stays, which is the film's own
 * end card.
 *
 * A Pause control sits on the film once it plays by this component's hand: a
 * loop that starts by itself must be stoppable by whoever is reading beside it
 * (WCAG 2.2.2). A film the visitor paused stays paused when it comes back on
 * screen: only they start it again. It is never drawn beside the browser's own
 * controls (reduced motion, or a browser that refused to play).
 *
 * `pause()` on a film still loading rejects its pending `play()` with an
 * AbortError: that is the reader scrolling past, not a browser refusing, and
 * it must not bring the browser's controls out. A browser that did refuse is
 * not asked again: with its controls the film is the visitor's to start.
 *
 * The preference is read on the first render (`getInitialValueInEffect: false`):
 * nothing in the markup depends on it, and read in an effect it would let the
 * film start for a moment before stopping.
 */
export function GoodiesFilm() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion(false, { getInitialValueInEffect: false });
  const [ours, setOurs] = useState(false);
  const [held, setHeld] = useState(false);
  // the observer outlives a render: it reads the visitor's pause from here
  const heldRef = useRef(false);
  // and whether the browser refused to play: from then on the film is the visitor's to start
  const refusedRef = useRef(false);

  /** Plays, and settles whose controls the film has: ours once it plays, the browser's if it refuses. */
  const play = (video: HTMLVideoElement) =>
    video.play().then(
      () => {
        video.controls = false;
        setOurs(true);
      },
      (error: unknown) => {
        if ((error as { name?: string } | null)?.name === 'AbortError') {
          return; // paused while loading: nobody refused anything
        }
        // A browser that refuses (low-power mode) leaves the poster and the controls.
        refusedRef.current = true;
        video.controls = true;
        setOurs(false);
      }
    );

  useEffect(() => {
    const video = ref.current;
    if (!video) {
      return;
    }
    // a browser that refused keeps its controls whatever the preference becomes: nothing else starts the film
    video.controls = reduce || refusedRef.current;
    if (reduce) {
      video.pause(); // the visitor plays it with the controls, or not at all
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        // `threshold` decides when this runs, not `isIntersecting`: a sliver on screen is still
        // "intersecting" as the film leaves, so the ratio decides.
        if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE) {
          if (!heldRef.current && !refusedRef.current) {
            void play(video);
          }
        } else {
          video.pause();
        }
      },
      { threshold: VISIBLE }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduce]);

  const togglePlay = () => {
    const video = ref.current;
    if (!video) {
      return;
    }
    const next = !held;
    heldRef.current = next;
    setHeld(next);
    if (next) {
      video.pause();
    } else {
      void play(video);
    }
  };

  return (
    <div className={classes.filmFrame}>
      <video
        ref={ref}
        className={classes.film}
        src="/goodies/goodies-film.mp4"
        poster="/goodies/goodies-film-poster.jpg"
        width={1280}
        height={720}
        muted
        loop
        playsInline
        preload="none"
        aria-label="The Netfox Goodies film: the three screen savers on a desk at night, then the wallpapers, an iPhone, a video call and the pixel-fox emoji"
      />
      {ours && !reduce && (
        <button type="button" className={classes.filmControl} onClick={togglePlay}>
          {held ? (
            <IconPlayerPlay size={18} aria-hidden />
          ) : (
            <IconPlayerPause size={18} aria-hidden />
          )}
          <span className={classes.hiddenLabel}>{held ? 'Play the film' : 'Pause the film'}</span>
        </button>
      )}
    </div>
  );
}
