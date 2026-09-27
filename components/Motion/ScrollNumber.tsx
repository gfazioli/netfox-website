'use client';

import type { CSSProperties } from 'react';
import { useReveal } from './useReveal';
import classes from './Motion.module.css';

/**
 * A number that rolls up from zero, digit by digit, the first time it comes
 * into view: the website's version of the app's rolling figures. Anything that
 * is not a digit ("%", ".", a letter) stands still beside the digits that roll.
 *
 * The text of the element is only ever `value`: the rolling digits are
 * generated content, so crawlers, screen readers and copy-paste never see
 * the strip of 0-9 behind each one. A value with no digits renders as text.
 */
export function ScrollNumber({
  value,
  delay = 0,
  className,
}: {
  value: string | number;
  delay?: number;
  className?: string;
}) {
  const text = String(value);
  const { ref, revealed } = useReveal<HTMLSpanElement>({ threshold: 0.6 });

  if (!/\d/.test(text)) {
    return <span className={className}>{text}</span>;
  }

  let digit = 0;
  return (
    <span
      ref={ref}
      className={[classes.number, className].filter(Boolean).join(' ')}
      data-revealed={revealed ? '' : undefined}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      <span className={classes.srOnly}>{text}</span>
      <span className={classes.odometer} aria-hidden="true">
        {[...text].map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className={classes.digit}>
              <span
                className={classes.strip}
                style={{ '--d': ch, '--i': digit++ } as CSSProperties}
              />
            </span>
          ) : (
            <span key={i} className={classes.glyph} data-ch={ch} />
          )
        )}
      </span>
    </span>
  );
}
