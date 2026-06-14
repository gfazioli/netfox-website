import type { MetadataRoute } from 'next';

// Web App Manifest. Next.js serves this at /manifest.webmanifest and injects
// the <link rel="manifest"> automatically. Gives the site a PWA identity
// (installable, themed) and clears the corresponding Lighthouse / SEO checks.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Netfox — Network Monitor for macOS',
    short_name: 'Netfox',
    description:
      'A native macOS app that monitors your home network — every device, when it joined, and what looks risky, at a glance.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1b1e',
    theme_color: '#f76707',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
