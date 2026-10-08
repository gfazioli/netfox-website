import config from '@/config';

export const resources = [
  {
    key: 'docs',
    title: 'Documentation',
    href: '/docs',
  },
  {
    key: 'getting-started',
    title: 'Getting Started',
    href: '/docs/getting-started',
  },
  {
    key: 'faq',
    title: 'FAQ',
    href: '/docs/faq',
  },
  {
    key: 'discord',
    title: 'Discord',
    href: config.community.discord,
    newWindow: true,
  },
  {
    key: 'issues',
    title: 'Report an Issue',
    href: 'mailto:feedback@netfox.app?subject=Netfox%20feedback',
  },
  {
    key: 'undolog',
    title: 'Undolog Blog',
    href: 'https://undolog.com',
    newWindow: true,
  },
];
