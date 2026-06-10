export default {
  metadata: {
    title: {
      // 53 characters — within the 50-60 OG sweet spot. Combines
      // the app's two main pillars (network monitoring + risk
      // scanning) so a link preview tells the user what the app
      // does, not just its name.
      default: 'Netfox — Network Scanner & Security Toolkit for macOS',
      template: '%s | Netfox',
    },
    description:
      'A native macOS app that monitors your home network. See every connected device, when it joined, and when something new appears — at a glance.',
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
    version: '0.7.0',
    minMacOS: '15.0',
    downloadUrl: 'https://github.com/gfazioli/netfox-website/releases/latest',
  },
} as const;
