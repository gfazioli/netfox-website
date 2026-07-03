import config from '@/config';

// schema.org JSON-LD injected site-wide. A SoftwareApplication node makes the
// site eligible for Google's app rich results; Organization + WebSite anchor
// the brand entity. Values are sourced from config so version/description stay
// in sync with the rest of the site.
// Single source of truth — derived from the canonical metadataBase so the
// JSON-LD URLs can't drift from the rest of the site's metadata.
const BASE = config.metadata.metadataBase.toString().replace(/\/$/, '');

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${BASE}/#app`,
      name: 'Netfox',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: `macOS ${config.app.minMacOS} or later`,
      inLanguage: ['en', 'it', 'fr', 'de', 'es'],
      description: config.metadata.description,
      url: BASE,
      downloadUrl: config.app.downloadUrl,
      softwareVersion: config.app.version,
      screenshot: `${BASE}/screenshot-overview.png`,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      publisher: { '@id': `${BASE}/#org` },
    },
    {
      '@type': 'Organization',
      '@id': `${BASE}/#org`,
      name: 'Netfox',
      url: BASE,
      logo: `${BASE}/icon-512x512.png`,
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE}/#website`,
      name: 'Netfox',
      url: BASE,
      publisher: { '@id': `${BASE}/#org` },
    },
  ],
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
