import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { Group } from '@mantine/core';

/**
 * Sidebar entry with a leading icon TILE, shared by every `_meta.tsx`
 * (root + tools/): the glyph in white on a small rounded square of the
 * entry's hue, the way macOS System Settings draws its sidebar and the app
 * draws its own settings. `hue` is a Mantine colour NAME ('teal'); with
 * none the tile is neutral. Every page entry reads as `nav(Icon, 'Label')`
 * or `nav(Icon, 'Label', hue)`.
 *
 * Tiles rather than tinted strokes, because a thin coloured line on the
 * docs' azure page cannot be both vivid and legible: the -5 tints measured
 * under 3:1 there, and the -9 shades that clear it read as dull. A filled
 * tile carries the full colour (a 5→7 gradient) and separates from the page
 * by its whole area, and the white glyph reads on it at every hue. On the
 * active row the tile stays coloured and takes a thin white ring
 * (app/global.css), so it does not merge into the blue highlight.
 */
export function nav(
  Icon: ComponentType<{ size?: number | string; stroke?: number | string }>,
  label: string,
  hue?: string
): { title: ReactNode } {
  const style = (
    hue
      ? {
          '--tile-top': `var(--mantine-color-${hue}-5)`,
          '--tile-bottom': `var(--mantine-color-${hue}-7)`,
        }
      : undefined
  ) as CSSProperties | undefined;
  return {
    title: (
      <Group component="span" gap={10} wrap="nowrap" align="center">
        <span className="nf-nav-tile" style={style}>
          <Icon size={13} stroke={2} />
        </span>
        {label}
      </Group>
    ),
  };
}
