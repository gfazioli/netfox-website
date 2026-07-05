import {
  IconBook2,
  IconChartLine,
  IconHelpCircle,
  IconHistory,
  IconKeyboard,
  IconLayoutNavbar,
  IconLayoutNavbarExpand,
  IconRocket,
  IconRoute,
  IconSettings,
  IconTool,
} from '@tabler/icons-react';
import { nav } from '@/lib/nav-helper';

// Colored to echo the app's palette (the Tools submenu already maps its
// entries to the per-tool gradient hues). Utility pages — Settings,
// Keyboard Shortcuts — stay uncolored so the feature pages read first,
// mirroring the FinderGit docs sidebar.
export default {
  index: nav(IconBook2, 'Introduction', 'var(--mantine-color-blue-5)'),
  '---': { type: 'separator' },
  'getting-started': nav(IconRocket, 'Getting Started', 'var(--mantine-color-orange-5)'),
  tools: nav(IconTool, 'Tools', 'var(--mantine-color-grape-5)'),
  'menu-bar': nav(IconLayoutNavbar, 'Menu Bar', 'var(--mantine-color-cyan-5)'),
  notch: nav(IconLayoutNavbarExpand, 'Notch HUD', 'var(--mantine-color-violet-5)'),
  settings: nav(IconSettings, 'Settings'),
  integrations: nav(IconChartLine, 'Integrations', 'var(--mantine-color-teal-5)'),
  'keyboard-shortcuts': nav(IconKeyboard, 'Keyboard Shortcuts'),
  '----': { type: 'separator' },
  faq: nav(IconHelpCircle, 'FAQ', 'var(--mantine-color-blue-5)'),
  'release-notes': nav(IconHistory, 'Release Notes', 'var(--mantine-color-green-5)'),
  roadmap: nav(IconRoute, 'Roadmap', 'var(--mantine-color-pink-5)'),
};
