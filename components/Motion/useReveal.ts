'use client';

import { useEffect, useRef, useState } from 'react';

interface RevealOptions {
  /** Share of the element that has to be on screen. */
  threshold?: number;
  /** Shrinks the viewport's bottom edge, so a reveal starts where the eye already is. */
  rootMargin?: string;
}

/**
 * One-shot: `revealed` turns true the first time the element comes into view
 * and stays true, so scrolling back up never replays a section. Where
 * IntersectionObserver does not exist (jsdom, very old browsers) it is true at
 * once: a reveal that cannot fire must not leave content hidden.
 */
export function useReveal<T extends Element>({
  threshold = 0.15,
  rootMargin = '0px 0px -8% 0px',
}: RevealOptions = {}) {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) {
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed, threshold, rootMargin]);

  return { ref, revealed };
}
