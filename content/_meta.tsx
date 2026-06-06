import {
  IconBook2,
  IconHelpCircle,
  IconHistory,
  IconKeyboard,
  IconLayoutNavbar,
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
  settings: nav(IconSettings, 'Settings'),
  'keyboard-shortcuts': nav(IconKeyboard, 'Keyboard Shortcuts'),
  '----': { type: 'separator' },
  faq: nav(IconHelpCircle, 'FAQ'),
  'release-notes': nav(IconHistory, 'Release Notes'),
  roadmap: nav(IconRoute, 'Roadmap'),
};
