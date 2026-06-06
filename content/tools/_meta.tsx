import {
  IconDevices,
  IconGauge,
  IconLayoutDashboard,
  IconShieldLock,
  IconWifi,
} from '@tabler/icons-react';
import { nav } from '@/lib/nav-helper';

export default {
  overview: nav(IconLayoutDashboard, 'Overview'),
  wifi: nav(IconWifi, 'Wi-Fi'),
  devices: nav(IconDevices, 'Devices'),
  security: nav(IconShieldLock, 'Security'),
  optimization: nav(IconGauge, 'Optimization'),
};
