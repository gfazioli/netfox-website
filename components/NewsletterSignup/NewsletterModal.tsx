'use client';

import { useEffect, useState } from 'react';
import type PromptDialog from './PromptDialog';
import { DISMISSED_KEY } from './prompt-open';

/**
 * Scroll-triggered newsletter prompt, ported from findergit.app.
 *
 * Once the visitor has scrolled past the hero, a dismissible modal with the
 * shared newsletter CTA appears — but only once: closing it persists a flag in
 * localStorage so it never nags again on future visits. Mounted once globally
 * in the root layout; the dialog itself is loaded only when it opens
 * (`PromptDialog` says why).
 */
const SCROLL_TRIGGER_PX = 1200;

/** Read by hand: Mantine's `readLocalStorageValue` put 0.7 KB on every page. */
function isDismissed() {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

function rememberClosed() {
  try {
    window.localStorage.setItem(DISMISSED_KEY, 'true');
  } catch {
    // Storage refused (site data blocked, a full quota): it closes for this
    // page load, and the watcher has already stopped.
  }
}

export function NewsletterModal() {
  // The dialog, once its chunk has loaded. It stays mounted from then on, so
  // closing plays it out. Loaded by hand rather than through `lazy`: React
  // holds back what a Suspense boundary reveals by up to 300 ms, and the
  // prompt came 350 ms after the scroll that opened it (Chrome, local
  // production build), where findergit.app's comes in 50.
  const [Dialog, setDialog] = useState<typeof PromptDialog | null>(null);

  // Watches the scroll only until the prompt opens, at most once a frame, and
  // not at all for a visitor who has closed it. Mantine's `useWindowScroll`,
  // which findergit.app's first version used, rendered on every scroll event
  // for as long as any page was open: 574 renders in a 13 s scroll down that
  // home page, three quarters of the script the scroll ran (production, CPU
  // 4x, 2026-10-13).
  useEffect(() => {
    if (isDismissed()) {
      return undefined;
    }
    let frame = 0;
    let gone = false;
    function stop() {
      window.removeEventListener('scroll', scrolled);
      window.cancelAnimationFrame(frame);
    }
    function check() {
      frame = 0;
      if (window.scrollY > SCROLL_TRIGGER_PX) {
        // At most once per page load. Closed in another tab since this one
        // loaded counts as closed here too.
        stop();
        if (!isDismissed()) {
          import('./PromptDialog').then(
            ({ default: loaded }) => {
              if (!gone) {
                setDialog(() => loaded);
              }
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
    return () => {
      gone = true;
      stop();
    };
  }, []);

  return Dialog ? <Dialog onClose={rememberClosed} /> : null;
}
