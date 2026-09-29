'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from '@tabler/icons-react';
import { useReducedMotion } from '@mantine/hooks';
import { dismissGuide, guideMemory, onGuideDismissed, sayNext } from './guide';
import { DELAY_MS, MIN_BUBBLE_PX, roomBeside, SNIFF_MS } from './HeroGuide';
import { Mascot } from './Mascot';
import { PING } from './sprite';
import { TRANSLATIONS } from './translations';
import classes from './ScrollGuide.module.css';

/** Where the fox is: nowhere, in the corner of the window, or on the Support card. */
type Place = 'none' | 'corner' | 'card';
type Phase = 'hidden' | 'arriving' | 'here' | 'leaving';
/** Closed; opened to say the hero's sentence; opened by the reader. */
type Bubble = 'closed' | 'hero' | 'asked';

/** Matches `corner-in` in the stylesheet. */
export const CORNER_IN_MS = 900;
/** Matches `card-in`. */
export const CARD_IN_MS = 420;
/** Matches the fade on the way out. */
export const LEAVE_MS = 260;
/**
 * How long the hero's sentence stays open in the corner. Beside the buttons it
 * stays, over nothing; in the corner it covers the page, so it folds away and
 * the fox is left, for a click to open it again.
 */
export const HERO_FOLD_MS = 8000;
/** After the last scroll event, before its legs stop. */
export const STILL_MS = 160;
/**
 * How much of the Support card has to be on screen for the fox to go to it. It
 * leaves once none of it is, so a card half in view does not send it back and
 * forth.
 */
export const CARD_RATIO = 0.3;

/** What it says on the Support card: the FAQ's own words, so no new claim. */
export const SPONSOR_LINE =
  'Netfox is currently free. If you find it useful, consider sponsoring the project.';

/** What the page has said about where the fox belongs. */
interface Seen {
  /** A beat has passed since the page mounted. */
  ready: boolean;
  /** The hero's row of buttons has been on screen, or is above it. */
  reached: boolean;
  /** The row is on screen now. */
  rowVisible: boolean;
  /** The fox beside the row has room to stand there (`HeroGuide`). */
  heroRoom: boolean;
  /** Enough of the Support card is on screen. */
  card: boolean;
}

/** Where the fox belongs, from what the page last said. */
function placeFor(page: Seen): Place {
  if (guideMemory.dismissed || !page.ready) {
    return 'none';
  }
  if (page.card) {
    return 'card';
  }
  // Before the buttons, nowhere; beside them, the hero's fox, where it has room.
  if (!page.reached || (page.rowVisible && page.heroRoom)) {
    return 'none';
  }
  return 'corner';
}

/** How long a translation stays in the announcer before it is cleared. */
const SPOKEN_MS = 1500;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The fox that follows the reader down the home page. Past the hero it rides in
 * the corner of the window, walking while the page scrolls and standing when it
 * stops; a click on it translates a piece of machine speak, as beside the
 * hero's buttons. At the footer it goes to the Support card and suggests
 * sponsoring the project. Asked for on 2026-09-29 with the other half of the
 * brief, the fox on a phone: *"sarebbe bello che si vedesse anche sul mobile"*,
 * *"che seguisse lo scroll della home page e suggerisse anche lo sponsor nel
 * footer"*.
 *
 * Where the window leaves no room right of the hero's buttons (a phone, any
 * window under about 1230 px), `HeroGuide` does not come, and this one says the
 * hero's sentence from the corner instead: once the buttons are in view it
 * walks in, pings, and shows the first translation, folded away again once the
 * buttons are scrolled past. Where there is room, it comes only once they are.
 * One fox at a time, then: never in the corner while the one beside the
 * buttons is on screen, and never in the corner while it stands on the card.
 *
 * Nothing it says on its own is announced: it moves with the scroll, and a
 * screen reader reading something else should not be interrupted by it. What
 * the reader asks for is, from a live region that comes with the fox.
 */
export function ScrollGuide() {
  const reduced = useReducedMotion();
  const reducedNow = useRef(reduced);
  const [at, setAt] = useState<Place>('none');
  const [phase, setPhase] = useState<Phase>('hidden');
  // Where it is and what it is doing, as the timers and observers see it.
  // Every change goes through `go`, which keeps the two together.
  const now = useRef<{ at: Place; phase: Phase }>({ at: 'none', phase: 'hidden' });
  const go = useCallback((nextAt: Place, nextPhase: Phase) => {
    now.current = { at: nextAt, phase: nextPhase };
    setAt(nextAt);
    setPhase(nextPhase);
  }, []);
  const [bubble, setBubbleState] = useState<Bubble>('closed');
  const bubbleNow = useRef<Bubble>('closed');
  const setBubble = useCallback((next: Bubble) => {
    bubbleNow.current = next;
    setBubbleState(next);
  }, []);
  const [index, setIndex] = useState(0);
  // The hero's sentence has been said from here, once, on arrival.
  const told = useRef(false);
  // What the announcer says: set only by what the reader asks for, and
  // cleared a moment later, so the same translation can be said again and a
  // screen reader reading the page does not meet it a second time.
  const [spoken, setSpoken] = useState('');
  const hush = useRef<number | undefined>(undefined);
  // One ping per mount of the rings.
  const [pings, setPings] = useState(0);
  const [moving, setMoving] = useState(false);
  const movingNow = useRef(false);
  // The Support card, once found: the fox is drawn into it there.
  const [card, setCard] = useState<HTMLElement | null>(null);
  // The fox's box, in whichever place it is.
  const box = useRef<HTMLDivElement>(null);
  // Where the reader opened the bubble: half a window of scroll away, it folds.
  const openedAt = useRef(0);
  // What the page says about where the fox belongs.
  const seen = useRef<Seen>({
    ready: false,
    reached: false,
    rowVisible: false,
    heroRoom: true,
    card: false,
  });
  const timers = useRef(new Set<number>());

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

  /**
   * The keyboard was on the fox, which is about to go: hand the focus to what
   * comes before it on the page rather than let it drop. Without scrolling to
   * it: the reader stays where they are.
   */
  const handFocusBack = useCallback(() => {
    const el = box.current;
    if (!el?.contains(document.activeElement)) {
      return;
    }
    const before = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (other) =>
        !el.contains(other) &&
        other.getClientRects().length > 0 &&
        el.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_PRECEDING
    );
    before.at(-1)?.focus({ preventScroll: true });
  }, []);

  const ping = useCallback(() => setPings((count) => count + 1), []);

  /** Once it stands in the corner with the hero's buttons in view, it says their sentence. */
  const arrived = useCallback(
    (place: Place) => {
      ping();
      if (place !== 'corner' || !seen.current.rowVisible || told.current) {
        return;
      }
      const open = () => {
        if (
          now.current.at === 'corner' &&
          now.current.phase === 'here' &&
          seen.current.rowVisible
        ) {
          told.current = true;
          setIndex(sayNext(TRANSLATIONS.length));
          setBubble('hero');
          later(() => {
            if (bubbleNow.current === 'hero') {
              setBubble('closed');
            }
          }, HERO_FOLD_MS);
        }
      };
      if (reducedNow.current) {
        open();
      } else {
        later(open, SNIFF_MS);
      }
    },
    [later, ping, setBubble]
  );

  /** Moves the fox to where it belongs: out of where it is first, then in. */
  const sync = useCallback(
    function syncPlace() {
      const want = placeFor(seen.current);
      const { at: here, phase: doing } = now.current;
      if (doing === 'leaving' || here === want) {
        return;
      }
      if (here !== 'none') {
        handFocusBack();
        cancelTimers();
        movingNow.current = false;
        setMoving(false);
        setBubble('closed');
        go(here, 'leaving');
        later(
          () => {
            go('none', 'hidden');
            syncPlace();
          },
          reducedNow.current ? 0 : LEAVE_MS
        );
        return;
      }
      if (reducedNow.current) {
        go(want, 'here');
        arrived(want);
        return;
      }
      go(want, 'arriving');
      later(
        () => {
          if (now.current.at === want && now.current.phase === 'arriving') {
            go(want, 'here');
            arrived(want);
          }
        },
        want === 'corner' ? CORNER_IN_MS : CARD_IN_MS
      );
    },
    [arrived, cancelTimers, go, handFocusBack, later, setBubble]
  );

  // Ready a beat after the page mounts, as the one beside the buttons is.
  useEffect(() => {
    const id = window.setTimeout(() => {
      seen.current.ready = true;
      sync();
    }, DELAY_MS);
    return () => {
      window.clearTimeout(id);
      cancelTimers();
    };
  }, [sync, cancelTimers]);

  // The hero's row of buttons: whether the reader has reached it, whether it
  // is on screen, and whether the fox beside it has room to stand there.
  useEffect(() => {
    const row = document.querySelector('[data-guide-anchor]');
    const page = seen.current;
    // Where nothing can say where the row is, the fox stays beside it
    // (`HeroGuide` has its own way in) and never comes to the corner.
    if (!row || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      page.rowVisible = entry.isIntersecting;
      // Above the window counts: a page reloaded halfway down has passed it.
      page.reached = entry.isIntersecting || entry.boundingClientRect.bottom <= 0;
      page.heroRoom = roomBeside(row) >= MIN_BUBBLE_PX;
      if (!entry.isIntersecting && bubbleNow.current === 'hero') {
        setBubble('closed');
      }
      sync();
    });
    observer.observe(row);
    const resized = () => {
      page.heroRoom = roomBeside(row) >= MIN_BUBBLE_PX;
      sync();
    };
    window.addEventListener('resize', resized);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resized);
    };
  }, [sync, setBubble]);

  // The footer's Support card.
  useEffect(() => {
    const el = document.getElementById('sponsors');
    if (!el || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    setCard(el);
    const page = seen.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        const was = page.card;
        if (entry.isIntersecting && entry.intersectionRatio >= CARD_RATIO) {
          page.card = true;
        } else if (!entry.isIntersecting) {
          page.card = false;
        }
        if (page.card !== was) {
          sync();
        }
      },
      { threshold: [0, CARD_RATIO] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  // Its legs go while the page scrolls, and a bubble the reader opened folds
  // once they have scrolled half a window on. One listener, passive; the state
  // changes only when it starts and when it stops.
  useEffect(() => {
    let still: number | undefined;
    const scrolled = () => {
      if (now.current.at === 'corner' && now.current.phase === 'here' && !reducedNow.current) {
        if (!movingNow.current) {
          movingNow.current = true;
          setMoving(true);
        }
        window.clearTimeout(still);
        still = window.setTimeout(() => {
          movingNow.current = false;
          setMoving(false);
        }, STILL_MS);
      }
      if (
        bubbleNow.current === 'asked' &&
        Math.abs(window.scrollY - openedAt.current) > window.innerHeight / 2
      ) {
        setBubble('closed');
      }
    };
    window.addEventListener('scroll', scrolled, { passive: true });
    return () => {
      window.clearTimeout(still);
      window.removeEventListener('scroll', scrolled);
    };
  }, [setBubble]);

  // Dismissed here, or beside the hero's buttons: it goes from everywhere.
  useEffect(() => onGuideDismissed(sync), [sync]);

  // Reduce Motion switched on mid-way: arrive now, and stand still.
  useEffect(() => {
    reducedNow.current = reduced;
    if (!reduced) {
      return;
    }
    movingNow.current = false;
    setMoving(false);
    if (now.current.phase === 'arriving') {
      cancelTimers();
      go(now.current.at, 'here');
      arrived(now.current.at);
    }
  }, [reduced, arrived, cancelTimers, go]);

  useEffect(() => () => window.clearTimeout(hush.current), []);

  /** A translation, asked for: the next one the fox has not said yet, said out loud. */
  const translate = () => {
    const next = sayNext(TRANSLATIONS.length);
    setIndex(next);
    ping();
    const { raw, plain } = TRANSLATIONS[next];
    setSpoken(`${raw}: ${plain}`);
    window.clearTimeout(hush.current);
    hush.current = window.setTimeout(() => setSpoken(''), SPOKEN_MS);
  };

  /**
   * The reader asked, on the fox or on Next: the next translation, in a bubble
   * that is theirs from now on, so it folds only once they scroll on.
   */
  const ask = () => {
    translate();
    if (bubbleNow.current !== 'asked') {
      openedAt.current = window.scrollY;
      setBubble('asked');
    }
  };

  /** The fox itself: lands it if it is on its way in, then says the next one. */
  const fromFox = () => {
    const { at: here, phase: doing } = now.current;
    if (here !== 'corner' || doing === 'leaving' || doing === 'hidden') {
      return;
    }
    if (doing === 'arriving') {
      cancelTimers();
      go('corner', 'here');
    }
    ask();
  };

  const rings = (
    <span
      key={`ping-${pings}`}
      className={classes.pings}
      style={{ left: `calc(var(--cell) * ${PING.x})`, top: `calc(var(--cell) * ${PING.y})` }}
    >
      <span className={classes.ring} />
      <span className={classes.ring} />
    </span>
  );

  const dismiss = (
    <button type="button" className={classes.dismiss} aria-label="Dismiss" onClick={dismissGuide}>
      <IconX size={12} stroke={2.2} />
    </button>
  );

  const said = TRANSLATIONS[index];
  const inCorner = at === 'corner' && (
    <div
      ref={box}
      className={classes.corner}
      data-phase={phase}
      data-moving={moving ? '' : undefined}
      inert={phase === 'leaving'}
    >
      <button
        type="button"
        className={classes.walker}
        aria-label={bubble === 'closed' ? 'Show a translation' : 'Show another translation'}
        onClick={fromFox}
      >
        {/* Keyed on the ping, so every new translation replays the hop. */}
        <Mascot
          key={`fox-${pings}`}
          walking={phase === 'arriving' || moving}
          pointing={bubble !== 'closed'}
        />
        {phase === 'here' && pings > 0 && rings}
      </button>
      {/* Mounted with the fox, before anything is said: a live region has
          to be there before its words change to be heard (CodeRabbit on #82),
          and the bubble opens with a translation already in it. */}
      <div className={classes.announcer} aria-live="polite" aria-atomic="true">
        {spoken}
      </div>
      {bubble !== 'closed' && phase === 'here' && (
        <div className={classes.bubble}>
          <div className={classes.say}>
            <span key={index} className={classes.caption}>
              <code className={classes.raw}>{said.raw}</code> <span>{said.plain}</span>
            </span>
            <button
              type="button"
              className={classes.next}
              aria-label="Next translation"
              onClick={ask}
            >
              Next →
            </button>
          </div>
          {dismiss}
        </div>
      )}
    </div>
  );

  const onCard =
    at === 'card' &&
    card &&
    createPortal(
      <div ref={box} className={classes.card} data-phase={phase} inert={phase === 'leaving'}>
        <span className={classes.sitter}>
          <Mascot key={`fox-${pings}`} pointing />
          {phase === 'here' && rings}
        </span>
        <div className={classes.cardBubble}>
          <p className={classes.cardLine}>{SPONSOR_LINE}</p>
          {dismiss}
        </div>
      </div>,
      card
    );

  return (
    <>
      {inCorner}
      {onCard}
    </>
  );
}
