export default {
  metadata: {
    title: {
      // 49 characters — within the OG/SERP sweet spot. Leads with the
      // positioning ("your network in plain English") rather than the
      // feature list; "network" + "macOS" keep the core search intent,
      // while the description and the keywords array still carry the
      // scanner/security/monitor terms.
      default: 'Netfox — Your Network in Plain English, for macOS',
      template: '%s | Netfox',
    },
    description:
      'Netfox turns raw network data into plain English on your Mac: decode every device, see what it exposes, and catch the services you didn’t mean to leave open. No cloud, no account.',
    metadataBase: new URL('https://netfox.app/'),
    keywords: [
      'Netfox',
      'macOS',
      'network monitor',
      'device discovery',
      'Bonjour',
      'ARP',
      'home network',
      'SwiftUI',
      'native app',
    ],
    generator: 'Next.js',
    applicationName: 'Netfox',
    appleWebApp: {
      title: 'Netfox',
    },
    openGraph: {
      url: './',
      siteName: 'Netfox',
      locale: 'en_US',
      type: 'website',
    },
    other: {
      'msapplication-TileColor': '#f76707',
    },
    twitter: {
      card: 'summary_large_image',
    },
    alternates: {
      canonical: './',
    },
  },
  nextraLayout: {
    docsRepositoryBase: 'https://github.com/gfazioli/netfox-website/tree/main/app/docs/',
    sidebar: {
      defaultMenuCollapseLevel: 1,
    },
  },
  head: {
    mantine: {
      defaultColorScheme: 'dark',
      nonce: '8IBTHwOdqNKAWeKl7plt8g==',
    },
  },
  gitHub: {
    // Note: the app repo is PRIVATE. Releases are published on the
    // public website repo so download URLs and the appcast can be
    // hosted somewhere everyone can reach.
    repo: 'gfazioli/netfox-website',
    apiUrl: 'https://api.github.com',
    releasesUrl: 'https://api.github.com/repos/gfazioli/netfox-website/releases',
  },
  releaseNotes: {
    // External link to the GitHub Releases page — used by the
    // "View full changelog on GitHub" button at the bottom of /docs/release-notes.
    url: 'https://github.com/gfazioli/netfox-website/releases',
    maxReleases: 10,
    // Releases share this repo with the website's own Mantine/Nextra
    // template releases (a `v6.x` tag on package bumps). Keep only Netfox
    // app releases (release.sh names them "Netfox X.Y.Z"), and render just
    // the most recent few — the rest are one click away on GitHub.
    appReleaseNamePrefix: 'Netfox',
    displayCount: 3,
  },
  search: {
    queryKeyword: 'q',
    minQueryLength: 3,
    limitKeyword: 'limit',
    defaultMaxResults: 5,
    excerptLengthKeyword: 'excerptLength',
    defaultExcerptLength: 30,
    defaultLanguage: 'en',
  },
  app: {
    version: '0.9.1',
    minMacOS: '15.0',
    downloadUrl: 'https://github.com/gfazioli/netfox-website/releases/latest',
  },
} as const;
