'use client';

import type { CSSProperties } from 'react';
import { useReveal } from './useReveal';
import classes from './Motion.module.css';

/**
 * A number that rolls up from zero, digit by digit, the first time it comes
 * into view: the website's version of the app's rolling figures. Anything that
 * is not a digit ("%", ",", a letter, a space) stands still beside the digits
 * that roll.
 *
 * The text of the element is only ever `value`: the rolling digits are
 * generated content, so crawlers, screen readers and copy-paste never see
 * the strip of 0-9 behind each one. A value with no digits renders as text.
 *
 * Off screen when the page mounted, it waits armed and rolls as it comes into
 * view (see `useReveal`). Already in view, it rolls up once from the first
 * paint by CSS alone (Motion.module.css), after the hold, and ends on the
 * value the server drew whether or not a script ever runs: its zeros last
 * the hold and the roll, never longer. The hero's release count used to read
 * "00 releases" until the bundle had hydrated, and for good when a chunk
 * failed to load.
 *
 * `delay` is optional on purpose: left out, the number takes `--reveal-delay`
 * from whatever it sits in.
 */
export function ScrollNumber({
  value,
  delay,
  className,
}: {
  value: string | number;
  delay?: number;
  className?: string;
}) {
  const text = String(value);
  const { ref, armed, revealed } = useReveal<HTMLSpanElement>({ threshold: 0.6 });

  if (!/\d/.test(text)) {
    return <span className={className}>{text}</span>;
  }

  // Each digit on its own, and whatever sits between digits as ONE run: a run
  // split into a box per letter loses its kerning ("left", "hours", "GB").
  const runs = text.match(/\d|\D+/g) ?? [];
  let digit = 0;
  return (
    <span
      ref={ref}
      className={[classes.number, className].filter(Boolean).join(' ')}
      data-armed={armed ? '' : undefined}
      data-revealed={revealed ? '' : undefined}
      style={
        delay === undefined ? undefined : ({ '--reveal-delay': `${delay}ms` } as CSSProperties)
      }
    >
      <span className={classes.srOnly}>{text}</span>
      <span className={classes.odometer} aria-hidden="true">
        {runs.map((run, i) =>
          /\d/.test(run) ? (
            <span key={i} className={classes.digit}>
              <span
                className={classes.strip}
                style={{ '--d': run, '--i': digit++ } as CSSProperties}
              />
            </span>
          ) : (
            <span key={i} className={classes.glyph} data-ch={run} />
          )
        )}
      </span>
    </span>
  );
}
