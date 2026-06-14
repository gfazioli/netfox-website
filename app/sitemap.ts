import type { MetadataRoute } from 'next';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Generated at build time. Enumerates the homepage plus every MDX doc under
// content/ (served at /docs/* via Nextra's contentDirBasePath). Filesystem
// walk rather than the Nextra page map so the output is deterministic and
// easy to reason about — every committed .mdx becomes one entry.
const BASE = 'https://netfox.app';
const CONTENT_DIR = join(process.cwd(), 'content');

interface DocPage {
  route: string;
  lastModified: Date;
}

function walk(dir: string, baseRoute: string, out: DocPage[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    // Skip Nextra meta files (_meta.tsx) and any underscore-prefixed entry.
    if (entry.name.startsWith('_')) {
      continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, `${baseRoute}/${entry.name}`, out);
    } else if (entry.name.endsWith('.mdx')) {
      const slug = entry.name.replace(/\.mdx$/, '');
      const route = slug === 'index' ? baseRoute : `${baseRoute}/${slug}`;
      out.push({ route, lastModified: statSync(full).mtime });
    }
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const docs: DocPage[] = [];
  walk(CONTENT_DIR, '/docs', docs);

  const entries: MetadataRoute.Sitemap = docs
    .sort((a, b) => a.route.localeCompare(b.route))
    .map((doc) => ({
      url: `${BASE}${doc.route}`,
      lastModified: doc.lastModified,
      changeFrequency: 'monthly',
      priority: doc.route === '/docs' ? 0.8 : 0.7,
    }));

  // Homepage first, highest priority.
  entries.unshift({
    url: `${BASE}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  });

  return entries;
}
