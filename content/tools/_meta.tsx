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
  overview: nav(IconLayoutDashboard, 'Overview', 'violet'),
  wifi: nav(IconWifi, 'Wi-Fi', 'teal'),
  devices: nav(IconDevices, 'Devices', 'blue'),
  security: nav(IconShieldLock, 'Security', 'red'),
  optimization: nav(IconGauge, 'Optimization', 'green'),
};
