import type { ReactNode } from 'react';
import { Group } from '@mantine/core';
import {
  IconDevices,
  IconGauge,
  IconLayoutDashboard,
  IconShieldLock,
  IconWifi,
} from '@tabler/icons-react';

// Same `nav(Icon, 'Label')` helper as the root `_meta.tsx` — kept local
// (not shared) because each file is a self-contained Nextra meta module
// and the helper is four lines.
function nav(Icon: typeof IconDevices, label: string): { title: ReactNode } {
  return {
    title: (
      <Group component="span" gap={8} wrap="nowrap" align="center">
        <Icon size={16} stroke={1.8} />
        {label}
      </Group>
    ),
  };
}

export default {
  overview: nav(IconLayoutDashboard, 'Overview'),
  wifi: nav(IconWifi, 'Wi-Fi'),
  devices: nav(IconDevices, 'Devices'),
  security: nav(IconShieldLock, 'Security'),
  optimization: nav(IconGauge, 'Optimization'),
};
