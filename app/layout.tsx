import '@mantine/core/styles.css';
// !! The order of these imports is important !!
import '@gfazioli/mantine-marquee/styles.css';
import '@gfazioli/mantine-text-animate/styles.css';
import '@gfazioli/mantine-scene/styles.css';
// Mantine theme overrides (body background, marquee fade edges, etc.)
import '@/theme/global.css';

import { Analytics } from '@vercel/analytics/react';
import { Layout } from 'nextra-theme-docs';
import { Banner, Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
// !! End of important imports !!

import { MantineFooter, MantineNavBar, StructuredData } from '@/components';
import config from '@/config';
import { theme } from '../theme';

import './global.css';

export const metadata = config.metadata;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pageMap = await getPageMap();
  const { nextraLayout, head } = config;

  return (
    <html lang="en" dir="ltr" {...mantineHtmlProps}>
      <Head>
        {/*
          Forced, not defaulted, and forced LIGHT although the site is at
          night: the night is written over Mantine's light scheme in
          variables (theme/global.css), which is what every component reads.
          `forceColorScheme` makes the pre-hydration script write `light`
          whatever is in local storage, so a visitor who toggled the old
          switch is not left on Mantine's dark scheme, which nothing here
          is written against.
        */}
        <ColorSchemeScript nonce={head.mantine.nonce} forceColorScheme="light" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#f76707" />
        {/* Keep pinch-zoom enabled — `user-scalable=no` is an accessibility/SEO ding. */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body>
        <StructuredData />
        <MantineProvider theme={theme} forceColorScheme="light">
          <Layout
            banner={
              <Banner storageKey={`netfox-release-${config.app.version}`}>
                {/*
                  Wrap the banner body in a single span. Nextra's Banner
                  internally maps over its children; passing two siblings
                  (the text node + the <a>) triggers React 19's "Each
                  child should have a unique key" warning surfaced through
                  the ConfigProvider.
                */}
                <span>
                  Netfox v{config.app.version} — a native network monitor for macOS.{' '}
                  <a href="/docs/release-notes">See what&apos;s new</a>
                </span>
              </Banner>
            }
            navbar={<MantineNavBar />}
            pageMap={pageMap}
            docsRepositoryBase={nextraLayout.docsRepositoryBase}
            footer={<MantineFooter />}
            sidebar={nextraLayout.sidebar}
            /*
              Nextra runs its DARK theme, forced, with no switch: the site is
              at night (theme/global.css), and its tables, callouts and code
              blocks then use the variants drawn for a dark ground. Mantine
              stays forced light above and the night is written over it in
              variables, which is what every component already reads.
            */
            darkMode={false}
            nextThemes={{ defaultTheme: 'dark', forcedTheme: 'dark' }}
          >
            {children}
          </Layout>
        </MantineProvider>
        <Analytics />
      </body>
    </html>
  );
}
