import type { ReactNode } from 'react';
import { Group } from '@mantine/core';
import {
  IconBook2,
  IconHelpCircle,
  IconKeyboard,
  IconLayoutNavbar,
  IconRocket,
  IconRoute,
  IconSettings,
  IconTool,
} from '@tabler/icons-react';

// Sidebar entry with a leading icon — same pattern as the FinderGit
// site. The icon inherits `currentColor`, so it tracks the link's
// active/hover colour automatically; the label stays a bare string (a
// Mantine `Text` would impose its own colour token and break that
// inheritance). Every entry reads as `nav(Icon, 'Label')`.
function nav(Icon: typeof IconBook2, label: string): { title: ReactNode } {
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
  index: nav(IconBook2, 'Introduction'),
  '---': { type: 'separator' },
  'getting-started': nav(IconRocket, 'Getting Started'),
  tools: nav(IconTool, 'Tools'),
  'menu-bar': nav(IconLayoutNavbar, 'Menu Bar'),
  settings: nav(IconSettings, 'Settings'),
  'keyboard-shortcuts': nav(IconKeyboard, 'Keyboard Shortcuts'),
  '----': { type: 'separator' },
  faq: nav(IconHelpCircle, 'FAQ'),
  'release-notes': '',
  roadmap: nav(IconRoute, 'Roadmap'),
};
