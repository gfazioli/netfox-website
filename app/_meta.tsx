import { Group } from '@mantine/core';
import { IconBrandDiscordFilled, IconCoffee, IconHeartFilled } from '@tabler/icons-react';
import config from '@/config';

export default {
  index: {
    display: 'hidden',
  },
  // The home page's feature grid. A root-relative href, so it works from a
  // docs page too; `#features` alone would look for the anchor there.
  features: {
    type: 'page',
    title: 'Features',
    href: '/#features',
  },
  docs: {
    type: 'page',
    title: 'Documentation',
  },
  download: {
    type: 'page',
    title: 'Download',
    href: '/download',
  },
  community: {
    title: 'Community',
    type: 'menu',
    items: {
      // First: the community's home since 2026-10-08. It opens in a new tab,
      // but with no ↗: Nextra draws that only after a string title, and an
      // icon makes this one JSX (measured here 2026-10-08: target _blank, no
      // arrow, while the string-titled Blog below it has one).
      discord: {
        title: (
          <Group component="span" gap={8} wrap="nowrap" align="center">
            <IconBrandDiscordFilled size={16} />
            Discord
          </Group>
        ),
        href: config.community.discord,
      },
      blog: {
        title: 'Blog',
        href: 'https://undolog.com/',
      },
      issues: {
        title: 'Report an Issue',
        href: 'mailto:feedback@netfox.app?subject=Netfox%20feedback',
      },
    },
  },
  about: {
    type: 'page',
    title: 'About',
    href: 'https://gfazioli.github.io/',
  },
  support: {
    title: 'Support',
    type: 'menu',
    items: {
      // The GitHub Sponsors page itself. This was `#sponsors`, which scrolled
      // to the footer's sponsor card, one step short of the page where
      // sponsoring happens. External, but with no ↗: Nextra draws it only
      // after a string title (the Community menu shows the difference).
      sponsor: {
        title: (
          <Group component="span" gap={8} wrap="nowrap" align="center">
            <IconHeartFilled size={16} />
            Sponsor
          </Group>
        ),
        href: 'https://github.com/sponsors/gfazioli',
      },
      // External donation link; no ↗, for the same reason as the sponsor's.
      coffee: {
        title: (
          <Group component="span" gap={8} wrap="nowrap" align="center">
            <IconCoffee size={16} />
            Buy me a coffee
          </Group>
        ),
        href: 'https://donate.stripe.com/fZu4gy4Tn3b1dgudGx0co00',
      },
    },
  },
};
