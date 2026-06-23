import '@mantine/core/styles.css';
// !! The order of these imports is important !!
import '@gfazioli/mantine-marquee/styles.css';
import '@gfazioli/mantine-text-animate/styles.css';
import '@gfazioli/mantine-scene/styles.css';
import '@gfazioli/mantine-depth-select/styles.css';
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
        <ColorSchemeScript
          nonce={head.mantine.nonce}
          defaultColorScheme={head.mantine.defaultColorScheme}
        />
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
        <MantineProvider theme={theme} defaultColorScheme={head.mantine.defaultColorScheme}>
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
              First visit defaults to dark (the brand scheme); the toggle still
              works. Mantine's defaultColorScheme already says 'dark', but the
              theme observer follows Nextra, whose own default is 'system' — so
              without this the site silently tracked the OS. Pin Nextra to dark too.
            */
            nextThemes={{ defaultTheme: 'dark' }}
          >
            {children}
          </Layout>
        </MantineProvider>
        <Analytics />
      </body>
    </html>
  );
}
