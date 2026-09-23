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

// Each entry is a coloured tile in the app's palette (the Tools submenu
// maps its entries to the per-tool hues). Utility pages — Settings,
// Keyboard Shortcuts — take the neutral tile so the feature pages read
// first; see lib/nav-helper.tsx for why tiles.
export default {
  index: nav(IconBook2, 'Introduction', 'blue'),
  '---': { type: 'separator' },
  'getting-started': nav(IconRocket, 'Getting Started', 'orange'),
  tools: nav(IconTool, 'Tools', 'grape'),
  'menu-bar': nav(IconLayoutNavbar, 'Menu Bar', 'cyan'),
  notch: nav(IconLayoutNavbarExpand, 'Notch HUD', 'violet'),
  settings: nav(IconSettings, 'Settings'),
  integrations: nav(IconChartLine, 'Integrations', 'teal'),
  'keyboard-shortcuts': nav(IconKeyboard, 'Keyboard Shortcuts'),
  '----': { type: 'separator' },
  faq: nav(IconHelpCircle, 'FAQ', 'blue'),
  'release-notes': nav(IconHistory, 'Release Notes', 'green'),
  roadmap: nav(IconRoute, 'Roadmap', 'pink'),
};
