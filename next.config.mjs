import bundleAnalyzer from '@next/bundle-analyzer';
import nextra from 'nextra';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withNextra = nextra({
  // No `latex`: no page on the site has any math (not one `$` in content/).
  search: {
    codeblocks: false,
  },
  contentDirBasePath: '/docs',
});

export default withNextra(
  withBundleAnalyzer({
    reactStrictMode: false,
    cleanDistDir: true,
    // AVIF first, WebP for a browser that cannot take it. Next picks the format
    // from the browser's Accept header and caches each apart: every current
    // browser takes AVIF, so the transformations Vercel bills move to AVIF, and
    // a WebP is made only for one that cannot. The first request for each one
    // encodes longer.
    images: {
      formats: ['image/avif', 'image/webp'],
    },
    // The shop's film and pictures in public/goodies were served
    // `max-age=0, must-revalidate`, so every visit and every range request of
    // the film asked again. A day fresh, a week stale while it revalidates:
    // the names carry no hash, so a replaced file still shows within a day.
    // Files only, by extension: /goodies/thanks and /goodies/licence are pages.
    async headers() {
      return [
        {
          source: '/goodies/:asset([^/]+\\.(?:mp4|jpg|png|webp))',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=86400, stale-while-revalidate=604800',
            },
          ],
        },
      ];
    },
    experimental: {
      optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    },
    turbopack: {
      rules: {
        '*.svg': {
          loaders: ['turbopack-inline-svg-loader'],
          condition: {
            content: /^[\s\S]{0,4000}$/, // <-- Inline SVGs smaller than ~4Kb (since Next.js v16)
          },
          as: '*.js',
        },
      },
    },
  })
);
