'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type PromptDialog from './PromptDialog';
import { closedRecently, DISMISSED_KEY } from './prompt-open';

/**
 * Scroll-triggered newsletter prompt, ported from findergit.app.
 *
 * Once the visitor has scrolled past the hero, a dismissible modal with the
 * shared newsletter CTA, and the Goodies below it, appears: at most once a
 * page load, and not for a day once closed. Closing it stores the time in
 * localStorage, and a visit 24 hours later sees it again
 * (`PROMPT_RETURNS_AFTER_MS`). Mounted once globally in the root layout; the
 * dialog itself is loaded only when it opens (`PromptDialog` says why).
 */
const SCROLL_TRIGGER_PX = 1200;

/** Read by hand: Mantine's `readLocalStorageValue` put 0.7 KB on every page. */
function isDismissed() {
  try {
    return closedRecently(window.localStorage.getItem(DISMISSED_KEY), Date.now());
  } catch {
    return false;
  }
}

/** Whether the closing time was stored, so the day it stays closed is counted. */
function rememberClosed() {
  try {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    return true;
  } catch {
    // Storage refused (site data blocked, a full quota): it closes for this
    // page load, and the watcher has already stopped.
    return false;
  }
}

export function NewsletterModal() {
  // The dialog, once its chunk has loaded. It stays mounted from then on, so
  // closing plays it out. Loaded by hand rather than through `lazy`: React
  // holds back what a Suspense boundary reveals by up to 300 ms, and the
  // prompt came 350 ms after the scroll that opened it (Chrome, local
  // production build), where findergit.app's comes in 50.
  const [Dialog, setDialog] = useState<typeof PromptDialog | null>(null);
  // Each opening mounts the dialog anew, which opens as it mounts.
  const [openings, setOpenings] = useState(0);
  // The prompt is open, or was closed where storage could not keep the time:
  // then it does not open again in this page load. Closed with the time kept,
  // the stored day decides, as on a later visit (Codex, round 2).
  const asked = useRef(false);
  // A client navigation keeps the root layout, and this with it: each new
  // page asks again whether the day it stays closed is over, or a tab left
  // open since the day it was closed would never see it again (Codex, round 1).
  const pathname = usePathname();

  // Watches the scroll only until the prompt opens, at most once a frame, and
  // not at all for a visitor who has closed it in the last day. Mantine's
  // `useWindowScroll`, which findergit.app's first version used, rendered on
  // every scroll event for as long as any page was open: 574 renders in a 13 s
  // scroll down that home page, three quarters of the script the scroll ran
  // (production, CPU 4x, 2026-10-13).
  useEffect(() => {
    if (asked.current || isDismissed()) {
      return undefined;
    }
    let frame = 0;
    function stop() {
      window.removeEventListener('scroll', scrolled);
      window.cancelAnimationFrame(frame);
    }
    function check() {
      frame = 0;
      if (window.scrollY > SCROLL_TRIGGER_PX) {
        // Once, until it is closed. Closed in another tab since this one
        // loaded counts as closed here too.
        stop();
        if (!isDismissed()) {
          asked.current = true;
          // Set even if the page has changed meanwhile: the prompt is the
          // layout's, not the page's that asked for it.
          import('./PromptDialog').then(
            ({ default: loaded }) => {
              setDialog(() => loaded);
              setOpenings((count) => count + 1);
            },
            // A chunk that cannot load (offline, a deploy in between) costs
            // the prompt and nothing else.
            () => undefined
          );
        }
      }
    }
    function scrolled() {
      if (!frame) {
        frame = window.requestAnimationFrame(check);
      }
    }
    window.addEventListener('scroll', scrolled, { passive: true });
    // A page that opens already past the trigger (a reload, a link to an
    // anchor) gets the prompt as a scroll there would have given it.
    scrolled();
    return stop;
  }, [pathname]);

  const closed = () => {
    if (rememberClosed()) {
      asked.current = false;
    }
  };

  return Dialog ? <Dialog key={openings} onClose={closed} /> : null;
}
