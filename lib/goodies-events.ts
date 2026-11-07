/**
 * The shop's own count of purchases and downloads, as server-side custom
 * events in the site's cookie-free Web Analytics. The pack's files live in a
 * private repository, and GitHub counts no download of a private release's
 * assets through its API (measured 2026-11-07: every asset reads 0 after
 * real downloads), so the site is the only place a download can be seen.
 *
 * Each event names its buyer by a tag, never by the session id: the id opens
 * the files for good, the tag only tells buyers apart. That is enough to say
 * how many buyers downloaded, how often, and which version; the statistics
 * hold no email, name or purchase number.
 *
 * Reading them back: `GET /v1/query/web-analytics/events/aggregate`, grouped by
 * `eventData/buyer` for purchases and `eventData/download` for downloads (the
 * macOS Studio does it through the `vercel` CLI). One property per event, so a
 * download's buyer, version and file come back together from a one-dimension
 * aggregate.
 */
import { createHash } from 'node:crypto';
import { track } from '@vercel/analytics/server';
import { warn, type PackKind } from '@/lib/goodies';

const PURCHASE_EVENT = 'Goodies purchase';
const DOWNLOAD_EVENT = 'Goodies download';

/** A buyer as the statistics know them: 12 hex characters of a SHA-256 of the session id. */
export function buyerTag(sessionId: string): string {
  return createHash('sha256').update(`netfox-goodies:${sessionId}`).digest('hex').slice(0, 12);
}

/**
 * What `track` sends besides the event: the visitor headers it counts by, and
 * a page with no key in it. Without a referer of our own it reports the
 * request's, and the download page's address carries the session id.
 */
function eventHeaders(request: Request, page: string): Record<string, string> {
  const headers: Record<string, string> = { referer: new URL(page, request.url).toString() };
  for (const name of ['user-agent', 'x-forwarded-for']) {
    const value = request.headers.get(name);
    if (value) {
      headers[name] = value;
    }
  }
  return headers;
}

/** Never fails the request it counts: a lost event is a smaller loss than a lost sale or download. */
async function record(
  request: Request,
  page: string,
  event: string,
  data: Record<string, string>
): Promise<void> {
  try {
    await track(event, data, { headers: eventHeaders(request, page) });
  } catch (error) {
    warn('statistics', error);
  }
}

/** A paid checkout, from the webhook. Stripe may deliver one twice: count buyers, not events. */
export function recordPurchase(request: Request, sessionId: string): Promise<void> {
  return record(request, '/goodies', PURCHASE_EVENT, { buyer: buyerTag(sessionId) });
}

/**
 * A file handed to a paid session: its one property is `<buyer> <version> <file>`, the version
 * without its `v`. A redirect handed out, not a file received: a double click counts twice.
 */
export function recordDownload(
  request: Request,
  sessionId: string,
  tag: string,
  kind: PackKind
): Promise<void> {
  return record(request, '/goodies/thanks', DOWNLOAD_EVENT, {
    download: `${buyerTag(sessionId)} ${tag.replace(/^v/i, '')} ${kind}`,
  });
}
