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

export default {
  index: nav(IconBook2, 'Introduction'),
  '---': { type: 'separator' },
  'getting-started': nav(IconRocket, 'Getting Started'),
  tools: nav(IconTool, 'Tools'),
  'menu-bar': nav(IconLayoutNavbar, 'Menu Bar'),
  notch: nav(IconLayoutNavbarExpand, 'Notch HUD'),
  settings: nav(IconSettings, 'Settings'),
  integrations: nav(IconChartLine, 'Integrations'),
  'keyboard-shortcuts': nav(IconKeyboard, 'Keyboard Shortcuts'),
  '----': { type: 'separator' },
  faq: nav(IconHelpCircle, 'FAQ'),
  'release-notes': nav(IconHistory, 'Release Notes'),
  roadmap: nav(IconRoute, 'Roadmap'),
};
