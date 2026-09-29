import type { ReactNode } from 'react';
import { SpriteSvg } from './SpriteSvg';

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
 * No JavaScript: a server component around the same drawing the home page
 * walks (`SpriteSvg`). The bubble's words are the page's own text, so a crawler
 * and a screen reader get them like any paragraph; the drawing is decoration
 * and says nothing (`aria-hidden` on the svg). Its one motion is CSS: a hop as
 * the page lands and on hover, and none under Reduce Motion. Its styles are
 * global (`.nf-note` in `app/global.css`), not a CSS module: a module here put
 * one more render-blocking stylesheet on every page of the site (#83).
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
    <aside className="nf-note" data-side={side} aria-label={label}>
      <span className="nf-note-sprite">
        <SpriteSvg pointing={pointing} />
      </span>
      <div className="nf-note-bubble">{children}</div>
    </aside>
  );
}
