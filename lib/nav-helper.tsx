import type { ComponentType, ReactNode } from 'react';
import { Group } from '@mantine/core';

/**
 * Sidebar entry with a leading icon, shared by every `_meta.tsx` (root +
 * tools/). `hue` is a Mantine colour NAME ('teal'); the stroke takes its -4
 * shade, which on the docs' night page is vivid and clears 3:1 at every hue
 * (the -5 tints were under it on the old azure page, and a stint as filled
 * tiles went with that page). With no hue the icon inherits currentColor and
 * tracks the link's own state. The hue is the SVG's `stroke` attribute, so on
 * the active row app/global.css puts it back to currentColor, or it vanished
 * into the blue highlight. Every page entry reads as `nav(Icon, 'Label')` or
 * `nav(Icon, 'Label', hue)`.
 */
export function nav(
  Icon: ComponentType<{ size?: number | string; stroke?: number | string; color?: string }>,
  label: string,
  hue?: string
): { title: ReactNode } {
  return {
    title: (
      <Group component="span" gap={8} wrap="nowrap" align="center">
        <Icon size={16} stroke={1.8} color={hue ? `var(--mantine-color-${hue}-4)` : undefined} />
        {label}
      </Group>
    ),
  };
}
