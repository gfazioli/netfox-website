'use client';

import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { useReveal } from './useReveal';
import classes from './Motion.module.css';

/** How an item arrives. See Motion.module.css for each starting pose. */
export type RevealVariant = 'morph' | 'rise' | 'pop' | 'left' | 'right';

/** Props that make an element a scope: the thing the observer watches. */
export function revealScope(revealed: boolean) {
  return {
    className: classes.scope,
    'data-revealed': revealed ? '' : undefined,
  };
}

/** Props that make an element an item: the thing that moves, `delay` ms after its scope. */
export function revealItem(variant: RevealVariant, delay = 0) {
  return {
    className: classes.item,
    'data-reveal': variant,
    style: { '--reveal-delay': `${delay}ms` } as CSSProperties,
  };
}

type RevealProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  variant?: RevealVariant;
  delay?: number;
  children: ReactNode;
};

/**
 * A wrapper that is its own scope and item: it watches itself and moves
 * itself. A wrapper rather than props on the child, so it never fights a
 * transform the child already uses for hover.
 */
export function Reveal({
  variant = 'morph',
  delay = 0,
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const scope = revealScope(revealed);
  const item = revealItem(variant, delay);
  return (
    <div
      ref={ref}
      {...rest}
      data-reveal={item['data-reveal']}
      data-revealed={scope['data-revealed']}
      className={[scope.className, item.className, className].filter(Boolean).join(' ')}
      style={{ ...item.style, ...style }}
    >
      {children}
    </div>
  );
}
