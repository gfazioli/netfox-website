'use client';

import type { CSSProperties } from 'react';
import { Box } from '@mantine/core';
import classes from './RadarPulse.module.css';

interface RadarPulseProps {
  /**
   * Where the waves emanate from, as a CSS position pair
   * (`'x y'`). Defaults to `'50% 100%'` (bottom-centre) which
   * gives the classic Wi-Fi-icon silhouette when paired with
   * `shape="arc"`.
   */
  origin?: string;
  /** Number of waves stacked / emitted in rotation. */
  count?: number;
  /** Seconds between successive wave emissions. */
  interval?: number;
  /** Seconds for a wave to travel from origin to `maxRadius`. */
  duration?: number;
  /** CSS color for the wave outline (Mantine token, hex, rgba). */
  color?: string;
  /**
   * How far each wave reaches before fading out. Accepts any CSS
   * length — `'1400px'`, `'80vmax'`, etc. Match this to the
   * height/width of the section the pulse is overlaid on.
   */
  maxRadius?: string;
  /** Border width of each ring in pixels. */
  strokeWidth?: number;
  /**
   * Peak opacity reached just after the wave is emitted. Decays
   * to 0 across the rest of the animation.
   */
  peakOpacity?: number;
  /**
   * `'arc'` clips each ring to its upper hemisphere — the Wi-Fi
   * silhouette. `'circle'` keeps the full ring — radar/sonar.
   */
  shape?: 'arc' | 'circle';
}

/**
 * Concentric arcs / circles pulsing outward from an origin. Fills
 * the same role a hypothetical `Scene.Radar` would in mantine-scene
 * — built inline here so we can iterate on the look before deciding
 * whether to upstream it as a library component.
 *
 * Drop it as a sibling of (or inside) a `Scene` block; it positions
 * itself absolutely against its containing relative ancestor and
 * is `pointer-events: none` so it never blocks interactions.
 */
export function RadarPulse({
  origin = '50% 100%',
  count = 4,
  interval = 1.5,
  duration = 6,
  color = 'var(--mantine-color-orange-5)',
  maxRadius = '1400px',
  strokeWidth = 2,
  peakOpacity = 0.45,
  shape = 'arc',
}: RadarPulseProps) {
  const [originX, originY] = origin.split(/\s+/);

  // Container variables seed every child wave so a single declared
  // colour / max radius applies uniformly. Per-wave variables only
  // need to carry the animation-delay.
  const containerStyle = {
    '--origin-x': originX,
    '--origin-y': originY,
    '--wave-color': color,
    '--wave-duration': `${duration}s`,
    '--max-radius': maxRadius,
    '--stroke-width': `${strokeWidth}px`,
    '--peak-opacity': peakOpacity,
  } as CSSProperties;

  return (
    <Box className={classes.container} style={containerStyle}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${classes.wave} ${shape === 'arc' ? classes.shapeArc : ''}`.trim()}
          style={{ animationDelay: `${i * interval}s` } as CSSProperties}
        />
      ))}
    </Box>
  );
}
