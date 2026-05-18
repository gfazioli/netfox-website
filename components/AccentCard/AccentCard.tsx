'use client';

import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { Paper, type PaperProps, Box } from '@mantine/core';
import classes from './AccentCard.module.css';

/**
 * Per-card style variables consumed by `AccentCard.module.css`. The
 * `--card-accent` CSS variable drives the radial gradient on the
 * card surface, the icon chip background, and the hover glow.
 *
 * Pass any valid CSS color expression (Mantine token like
 * `var(--mantine-color-blue-5)`, raw hex `#6d6585`, `rgba(…)`).
 */
interface AccentCardStyle extends CSSProperties {
  '--card-accent': string;
}

type AccentCardProps = Omit<PaperProps, 'children'> & {
  /** CSS color for the accent gradient and hover glow. */
  accent: string;
  children: ReactNode;
};

/**
 * Dark card with a per-instance accent color radiating from the
 * top-left corner. Wraps Mantine's `<Paper>` and stamps in the
 * `--card-accent` variable plus the shared `.card` styles.
 *
 * Defaults: padding `xl`, radius `lg`. Override either via the
 * pass-through `PaperProps`.
 */
export function AccentCard({ accent, children, className, style, ...paperProps }: AccentCardProps) {
  return (
    <Paper
      {...paperProps}
      p={paperProps.p ?? 'xl'}
      radius={paperProps.radius ?? 'lg'}
      className={`${classes.card} ${className ?? ''}`.trim()}
      style={{ ...(style ?? {}), '--card-accent': accent } as AccentCardStyle}
    >
      {children}
    </Paper>
  );
}

/**
 * Square chip that holds a Tabler icon, styled with a vertical
 * gradient that pulls from the parent `AccentCard`'s `--card-accent`
 * variable. Drop it as the first child of an `AccentCard` and it
 * picks up the same accent automatically — no per-icon prop.
 *
 * The icon size is computed as 55 % of the chip size so the glyph
 * sits centred with comfortable padding inside the rounded square.
 */
interface GradientIconProps {
  icon: ComponentType<{ size: number }>;
  size?: number;
}

export function GradientIcon({ icon: Icon, size = 48 }: GradientIconProps) {
  return (
    <Box
      className={classes.iconChip}
      style={{ '--chip-size': `${size}px` } as CSSProperties}
    >
      <Icon size={Math.round(size * 0.55)} />
    </Box>
  );
}

/**
 * Inline highlight pill for "this is the thing the alternative gets
 * wrong" callouts. Wraps natively with the surrounding text instead
 * of breaking onto its own line.
 */
export function HighlightPill({ children }: { children: ReactNode }) {
  return <span className={classes.highlightPill}>{children}</span>;
}
