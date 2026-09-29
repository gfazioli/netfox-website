'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { useReducedMotion } from '@mantine/hooks';
import { Mascot, SCALE } from './Mascot';
import { PING, WIDTH } from './sprite';
import { TRANSLATIONS } from './translations';
import classes from './Mascot.module.css';

type Phase = 'hidden' | 'walking' | 'sniffing' | 'pointing' | 'leaving';

/** After the buttons come into view, a beat before it sets out. */
export const DELAY_MS = 700;
/** Matches `walk-in` in the stylesheet. */
export const WALK_MS = 2200;
/** The hop and the two rings of the ping (`hop`, `ping`), before the paw goes up. */
export const SNIFF_MS = 1100;
/** Matches the fade on `.hint`. */
const LEAVE_MS = 260;
/** After the last resize event, before it walks in again. */
export const RESIZE_SETTLE_MS = 400;

/** How far right of the buttons it stands (`.hint`'s `left`). */
const STAND_OFF_PX = 14;
/** Between the fox and its bubble (`.bubble`'s `left`). */
const BUBBLE_GAP_PX = 10;
/** Kept clear at the window's right edge. */
const EDGE_PX = 24;
/**
 * The narrowest bubble worth drawing: a translation still reads as a sentence
 * at this width. With less room than this right of the buttons, the fox does
 * not come at all: below about 1230 px of window (the row of buttons is 556
 * px wide), measured on the built page.
 */
export const MIN_BUBBLE_PX = 200;

/**
 * What the guide remembers, for the life of the page: module state survives a
 * client navigation and is gone on a reload. Once dismissed it does not walk in
 * again when the reader comes back to the home page through a link; a reload
 * brings it back, as lancetta.app's and findergit.app's do (user, 2026-09-24,
 * on lancetta.app: "facciamolo apparire sempre ad ogni reload della pagina").
 * Exported for the tests.
 */
export const guideMemory = { dismissed: false };

/** The width left for the bubble right of the buttons and the fox, in px. */
function roomBeside(row: Element) {
  return (
    document.documentElement.clientWidth -
    row.getBoundingClientRect().right -
    STAND_OFF_PX -
    WIDTH * SCALE -
    BUBBLE_GAP_PX -
    EDGE_PX
  );
}

/**
 * The hero says Netfox turns machine speak into plain English; the fox shows
 * it, one example at a time. It is the app icon's fox, walking -- see
 * `sprite.ts` for the drawing and why it is ours -- and it comes in from the
 * right once the buttons are in view, stops beside them, pings the radar on
 * its forehead as the icon's does, then raises a paw and says what a piece of
 * machine speak means (`translations.ts`). A click on it, or on what it says,
 * pings again and translates the next one. lancetta.app's mascot points at the
 * reading that opens its panel, findergit.app's narrates the hero carousel;
 * this one is the hero's own sentence, demonstrated.
 *
 * It arrives on EVERY load, and nothing is decided before mount, so the served
 * markup carries none of it. A reader who asked for reduced motion gets it
 * standing in place, already pointing: settled, not skipped. Where the window
 * leaves no room for what it says right of the buttons (`MIN_BUBBLE_PX`), it
 * does not come; a resize that takes the room away sends it off, and one that
 * gives it back brings it in again.
 */
export function HeroGuide() {
  const reduced = useReducedMotion();
  // Read when a timer runs out, not when the page mounts: the hook answers
  // `false` on the first render and the real value after it.
  const reducedNow = useRef(reduced);
  const [phase, setPhase] = useState<Phase>('hidden');
  // The phase as the timers and the observer see it: they run outside React's
  // render, where the state would be a stale closure. Every change goes
  // through `move`, which keeps the two together.
  const phaseNow = useRef<Phase>('hidden');
  const move = useCallback((next: Phase) => {
    phaseNow.current = next;
    setPhase(next);
  }, []);
  const [index, setIndex] = useState(0);
  // One ping per mount of the rings: on arrival, then one per translation.
  const [pings, setPings] = useState(0);
  const anchor = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const timers = useRef(new Set<number>());
  // Whether the buttons have come into view: from then on the room decides
  // whether it is there.
  const arrived = useRef(false);
  // Which walk the pending timers belong to. A walk cut short by a resize and
  // started again must not be moved on by the timers of the first one.
  const walk = useRef(0);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }, []);

  const cancelTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  /** The room for the bubble, handed to the stylesheet as its widest. */
  const measure = useCallback(() => {
    const el = anchor.current;
    if (!el) {
      return 0;
    }
    const room = roomBeside(el);
    el.style.setProperty('--nf-guide-room', `${Math.max(0, Math.floor(room))}px`);
    return room;
  }, []);

  /**
   * The keyboard was on something of the fox's that is about to go: hand the
   * focus to the button it was standing beside, rather than let it drop to
   * the page.
   */
  const handFocusBack = useCallback(() => {
    if (hint.current?.contains(document.activeElement)) {
      const links = anchor.current?.parentElement?.querySelectorAll<HTMLElement>('a[href]');
      links?.[links.length - 1]?.focus();
    }
  }, []);

  const walkIn = useCallback(() => {
    if (guideMemory.dismissed || phaseNow.current !== 'hidden' || measure() < MIN_BUBBLE_PX) {
      return;
    }
    if (reducedNow.current) {
      move('pointing');
      return;
    }
    walk.current += 1;
    const mine = walk.current;
    move('walking');
    later(() => {
      if (walk.current !== mine || phaseNow.current !== 'walking') {
        return;
      }
      move('sniffing');
      later(() => {
        if (walk.current === mine && phaseNow.current === 'sniffing') {
          move('pointing');
        }
      }, SNIFF_MS);
    }, WALK_MS);
  }, [later, measure, move]);

  useEffect(() => {
    const el = anchor.current;
    if (!el || guideMemory.dismissed) {
      return undefined;
    }
    const arrive = () => {
      arrived.current = true;
      later(walkIn, DELAY_MS);
    };
    // Where nothing can say the buttons came into view, it comes after the delay.
    if (typeof IntersectionObserver === 'undefined') {
      arrive();
      return cancelTimers;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          arrive();
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelTimers();
    };
  }, [later, walkIn, cancelTimers]);

  // The room is the window's to give and take. Made too narrow for what it
  // says, the fox goes, rather than squeeze its bubble into a column; given
  // the room back -- or given it for the first time, where the buttons came
  // into view in a narrow window -- it walks in again, from the start, once
  // the resize has settled.
  useEffect(() => {
    let settle: number | undefined;
    const resized = () => {
      window.clearTimeout(settle);
      if (!arrived.current || guideMemory.dismissed) {
        return;
      }
      const now = phaseNow.current;
      if (measure() < MIN_BUBBLE_PX) {
        if (now !== 'hidden' && now !== 'leaving') {
          handFocusBack();
          cancelTimers();
          move('hidden');
        }
      } else if (now === 'hidden') {
        settle = window.setTimeout(walkIn, RESIZE_SETTLE_MS);
      }
    };
    window.addEventListener('resize', resized);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener('resize', resized);
    };
  }, [measure, handFocusBack, cancelTimers, move, walkIn]);

  // Reduce Motion switched on mid-way: land where it was going, now.
  useEffect(() => {
    reducedNow.current = reduced;
    if (reduced && (phaseNow.current === 'walking' || phaseNow.current === 'sniffing')) {
      move('pointing');
    }
  }, [reduced, move]);

  /** A click mid-walk lands it; once it points, each click translates the next one. */
  const next = () => {
    // On its way out it stays on its way out: a key pressed on it as it fades
    // must not bring it back.
    if (phaseNow.current === 'leaving' || phaseNow.current === 'hidden') {
      return;
    }
    if (phaseNow.current !== 'pointing') {
      move('pointing');
      return;
    }
    setIndex((now) => (now + 1) % TRANSLATIONS.length);
    setPings((now) => now + 1);
  };

  const dismiss = () => {
    guideMemory.dismissed = true;
    handFocusBack();
    move('leaving');
    later(() => move('hidden'), LEAVE_MS);
  };

  const said = TRANSLATIONS[index];
  return (
    <div ref={anchor} className={classes.anchor}>
      {phase !== 'hidden' && (
        <div
          ref={hint}
          className={classes.hint}
          data-phase={phase}
          // Fading out, it is out of reach: a Tab during the fade would
          // otherwise land on a fox about to unmount and drop the focus
          // again (review of #82, round 2).
          inert={phase === 'leaving'}
        >
          <button
            type="button"
            className={classes.walker}
            // Until it points, a click lands it with the first one.
            aria-label={phase === 'pointing' ? 'Show another translation' : 'Show the translation'}
            onClick={next}
          >
            {/* Keyed on the ping, so every new translation replays the hop. */}
            <Mascot
              key={`fox-${pings}`}
              walking={phase === 'walking'}
              pointing={phase === 'pointing'}
            />
            {(phase === 'sniffing' || phase === 'pointing') && (
              <span
                key={`ping-${pings}`}
                className={classes.pings}
                style={{ left: PING.x * SCALE, top: PING.y * SCALE }}
              >
                <span className={classes.ring} />
                <span className={classes.ring} />
              </span>
            )}
          </button>
          {phase === 'pointing' && (
            <div className={classes.bubble}>
              {/* Named for what it says AND for what it does: the visible
                  "Next" has to be in the name (WCAG 2.5.3), and the arrow is
                  not worth reading out. */}
              <button
                type="button"
                className={classes.say}
                aria-label={`${said.raw}: ${said.plain} Next`}
                onClick={next}
              >
                <span key={index} className={classes.caption}>
                  <code className={classes.raw}>{said.raw}</code>
                  <span>{said.plain}</span>
                </span>
                <span className={classes.next}>Next →</span>
              </button>
              <button
                type="button"
                className={classes.dismiss}
                aria-label="Dismiss"
                onClick={dismiss}
              >
                <IconX size={12} stroke={2.2} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
