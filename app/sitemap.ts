import type { MetadataRoute } from 'next';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import config from '@/config';

// Generated at build time. Enumerates the homepage plus every MDX doc under
// content/ (served at /docs/* via Nextra's contentDirBasePath). Filesystem
// walk rather than the Nextra page map so the output is deterministic and
// easy to reason about — every committed .mdx becomes one entry.
//
// No `lastModified`, on any URL. It used to be each file's mtime, and on
// Vercel that is the moment the build cloned the repository: all 15 docs
// pages and the homepage carried the same date, which moved on every deploy
// whether or not a page had changed (2026-09-29 audit). A date that is always
// "now" is a signal crawlers learn to ignore; none at all is the honest one.
const BASE = config.metadata.metadataBase.toString().replace(/\/$/, '');
const CONTENT_DIR = join(process.cwd(), 'content');

function walk(dir: string, baseRoute: string, out: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    // Skip Nextra meta files (_meta.tsx) and any underscore-prefixed entry.
    if (entry.name.startsWith('_')) {
      continue;
    }
    if (entry.isDirectory()) {
      walk(join(dir, entry.name), `${baseRoute}/${entry.name}`, out);
    } else if (entry.name.endsWith('.mdx')) {
      const slug = entry.name.replace(/\.mdx$/, '');
      out.push(slug === 'index' ? baseRoute : `${baseRoute}/${slug}`);
    }
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: string[] = [];
  walk(CONTENT_DIR, '/docs', routes);

  const entries: MetadataRoute.Sitemap = routes
    .sort((a, b) => a.localeCompare(b))
    .map((route) => ({
      url: `${BASE}${route}`,
      changeFrequency: 'monthly',
      priority: route === '/docs' ? 0.8 : 0.7,
    }));

  // Homepage first, highest priority.
  entries.unshift({
    url: `${BASE}/`,
    changeFrequency: 'weekly',
    priority: 1,
  });

  return entries;
}
