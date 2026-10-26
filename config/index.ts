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
      'Netfox turns raw network data into plain English on your Mac: decode every device, see what it exposes, and catch services left open. No cloud, no account.',
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
      site: '@gfazioli',
      creator: '@gfazioli',
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
  releaseCadence: {
    // The homepage strip states the app's total downloads only from this
    // many on: a small number reads as "hardly anyone uses it", which is the
    // opposite of what the line is there to say. Below it the strip simply
    // leaves the figure out. Each app site sets its own.
    downloadsShownFrom: 1000,
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
    version: '0.52.2',
    // Publication date of `version`, UTC, written by release.sh next to the
    // version itself. It is the OFFLINE FALLBACK for the homepage release
    // strip: the live date and the release count come from the GitHub
    // releases API, and this is what the strip shows when that call is
    // rate-limited or down. Also the JSON-LD `dateModified`.
    releaseDate: '2026-10-26',
    // 15.6, not 15.0: it is the pbxproj MACOSX_DEPLOYMENT_TARGET and the
    // appcast's sparkle:minimumSystemVersion. Only StructuredData reads this,
    // so a wrong value here is invisible on the page and still published to
    // search engines as the supported OS.
    minMacOS: '15.6',
    downloadUrl: 'https://github.com/gfazioli/netfox-website/releases/latest',
  },
  // Who publishes the site, as Italian law asks every VAT-registered owner to
  // say: the VAT number on the home page (art. 35 DPR 633/72), and name,
  // contact and VAT number reachable from every page (art. 7 D.Lgs. 70/2003).
  // The footer's last line reads these, and so do /docs/legal and
  // /docs/privacy. The contact addresses are written in those two pages as
  // plain markdown links, which is what gets the docs' link style (a JSX <a>
  // in MDX gets none), so they are not kept here. The same
  // values on every Undolog site.
  legal: {
    brand: 'Undolog',
    owner: 'Giovambattista Fazioli',
    vatNumber: '12343751009',
  },
  // The community's home since 2026-10-08: the Undolog Discord server, shared
  // by FinderGit, Netfox, Lancetta and octoscope. The invite never expires.
  // The Undolog Slack it replaces is being retired: link nothing there. Every
  // page reads the invite from here; no MDX page writes it out.
  community: {
    discord: 'https://discord.gg/rdWu5yFCR6',
    // The app version current when the server opened. The home page's "Just
    // opened" badge decays from it (`isRecent`): gone two minor releases on,
    // with no one having to remember it.
    discordSince: '0.29.1',
  },
  // The directories Netfox is listed on, as badges, in this order
  // (`components/DirectoryBadges`, ported from findergit.app). `placement`
  // says where each one goes: Product Hunt's alone stays under the hero, where
  // its vote count is proof a visitor reads; the others go in the footer's
  // "Listed on" row, under the Support card, on every page (the user,
  // 2026-10-08: the hero was getting crowded, and more listings are coming).
  // A directory asks for its badge on the site in return for the listing, and
  // some verify it by fetching the home page: the footer is in its served HTML
  // too. The link has to carry no nofollow, sponsored or ugc. `width` and `height` are the
  // badge's intrinsic size, its SVG's viewBox, and only their ratio is used:
  // the stylesheet draws every badge at one height.
  //
  // `src` is the directory's own URL, exactly as its embed code gives it,
  // never a copy served from here: a verifier may look for its badge IMAGE as
  // well as the link (LaunchNest refused a copy on findergit.app). Fazier,
  // LaunchVault and ProgrammerNeeds were dropped on 2026-10-24 (the user).
  directoryBadges: [
    {
      name: 'Product Hunt',
      // Widened: no directory is in the footer now, but the row is still there for the next one.
      placement: 'hero' as 'hero' | 'footer',
      href: 'https://www.producthunt.com/products/netfox?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-netfox',
      src: 'https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1156418&theme=light&t=1779880374909',
      alt: 'Netfox - A native local macOS network monitor | Product Hunt',
      width: 250,
      height: 54,
    },
  ],
} as const;
