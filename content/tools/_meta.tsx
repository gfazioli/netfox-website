import {
  IconDevices,
  IconGauge,
  IconLayoutDashboard,
  IconShieldLock,
  IconWifi,
} from '@tabler/icons-react';
import { nav } from '@/lib/nav-helper';

// Tinted to the app's per-tool gradient palette (SectionTheme):
// violet Overview, teal Wi-Fi, blue Devices, red Security, green
// Optimization — so the docs sidebar echoes the app's colour language.
export default {
  overview: nav(IconLayoutDashboard, 'Overview', 'var(--mantine-color-violet-5)'),
  wifi: nav(IconWifi, 'Wi-Fi', 'var(--mantine-color-teal-5)'),
  devices: nav(IconDevices, 'Devices', 'var(--mantine-color-blue-5)'),
  security: nav(IconShieldLock, 'Security', 'var(--mantine-color-red-5)'),
  optimization: nav(IconGauge, 'Optimization', 'var(--mantine-color-green-5)'),
};
