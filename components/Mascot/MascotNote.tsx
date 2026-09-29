import type { ReactNode } from 'react';
import { Mascot } from './Mascot';
import classes from './MascotNote.module.css';

interface MascotNoteProps {
  children: ReactNode;
  /** Paw up: a wave on the left of the bubble, a point at it on the right. */
  pointing?: boolean;
  /** Which side of the bubble it stands on. */
  side?: 'left' | 'right';
  /** What the note is, for assistive technology: it is an aside, not the page's text. */
  label?: string;
}

/**
 * The fox in the docs, beside a speech bubble: to welcome a reader, or to point
 * at the thing worth knowing on a page. Here and there, never on every page, or
 * it stops being a moment (user, 2026-09-29: "la sua presenza nella doc in
 * particolari punti sarebbe carina"). Cross-ported from findergit.app's.
 *
 * No JavaScript: a server component around the same sprite the home page walks
 * (`Mascot`). The bubble's words are the page's own text, so a crawler and a
 * screen reader get them like any paragraph; the drawing is decoration and says
 * nothing (`aria-hidden` on the svg). Its one motion is CSS: a hop as the page
 * lands and on hover, and none under Reduce Motion.
 *
 * On the right, pointing, the raised paw reaches up and left toward the bubble;
 * on the left it reads as a wave. Never mirrored to make it point the other
 * way: the drawing is the app icon's fox, and a mirrored drawing is another.
 */
export function MascotNote({
  children,
  pointing = false,
  side = 'left',
  label = 'Note',
}: MascotNoteProps) {
  return (
    <aside className={classes.note} data-side={side} aria-label={label}>
      <span className={classes.sprite}>
        <Mascot pointing={pointing} />
      </span>
      <div className={classes.bubble}>{children}</div>
    </aside>
  );
}
