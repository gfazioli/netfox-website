import type { ComponentType, ReactNode } from 'react';
import { Group } from '@mantine/core';

/**
 * Sidebar entry with a leading icon, shared by every `_meta.tsx`
 * (root + tools/). With no `color`, the icon inherits `currentColor`,
 * so it tracks the link's active/hover colour automatically. Pass a
 * `color` (a Mantine colour var, e.g. `var(--mantine-color-teal-5)`)
 * to tint an entry to a fixed hue — used to map the Tools entries to
 * the app's per-tool palette. A tinted icon no longer tracks
 * active/hover state, which is fine: the active row already carries a
 * background highlight. Every page entry reads as `nav(Icon, 'Label')`
 * or `nav(Icon, 'Label', color)`.
 */
export function nav(
  Icon: ComponentType<{ size?: number | string; stroke?: number | string; color?: string }>,
  label: string,
  color?: string
): { title: ReactNode } {
  return {
    title: (
      <Group component="span" gap={8} wrap="nowrap" align="center">
        <Icon size={16} stroke={1.8} color={color} />
        {label}
      </Group>
    ),
  };
}
