'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@mantine/hooks';
import classes from './Goodies.module.css';

/** How much of the film must be on screen for it to play. */
const VISIBLE = 0.25;

/**
 * The pack's 30-second film, an exact loop, muted (it has no sound).
 *
 * It plays only while at least a quarter of it is on screen, so a reader who
 * scrolled past is not decoding video at rest, and never on its own for a
 * visitor who asked for reduced motion: they get the poster and the controls.
 * Without scripts the poster stays, which is the film's own end card.
 *
 * The preference is read on the first render (`getInitialValueInEffect: false`):
 * nothing in the markup depends on it, and read in an effect it would let the
 * film start for a moment before stopping.
 */
export function GoodiesFilm() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion(false, { getInitialValueInEffect: false });

  useEffect(() => {
    const video = ref.current;
    if (!video) {
      return;
    }
    video.controls = reduce;
    if (reduce) {
      video.pause(); // the visitor plays it with the controls, or not at all
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        // `threshold` decides when this runs, not `isIntersecting`: a sliver on screen is still
        // "intersecting" as the film leaves, so the ratio decides.
        if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE) {
          // A browser that refuses (low-power mode) leaves the poster and the controls.
          video.play().catch(() => {
            video.controls = true;
          });
        } else {
          video.pause();
        }
      },
      { threshold: VISIBLE }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduce]);

  return (
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
      preload="metadata"
      aria-label="The Netfox Goodies film: the three screen savers on a desk at night, then the wallpapers, an iPhone, a video call and the pixel-fox emoji"
    />
  );
}
