import type { ComponentType, ReactNode } from 'react';
import { Group } from '@mantine/core';

/**
 * Sidebar entry with a leading icon, shared by every `_meta.tsx`
 * (root + tools/). The icon inherits `currentColor`, so it tracks the
 * link's active/hover colour automatically — which is why the label
 * stays a bare string (a Mantine `Text` would impose its own colour
 * token and break that inheritance). Every page entry reads as
 * `nav(Icon, 'Label')`.
 */
export function nav(
  Icon: ComponentType<{ size?: number | string; stroke?: number | string }>,
  label: string
): { title: ReactNode } {
  return {
    title: (
      <Group component="span" gap={8} wrap="nowrap" align="center">
        <Icon size={16} stroke={1.8} />
        {label}
      </Group>
    ),
  };
}
