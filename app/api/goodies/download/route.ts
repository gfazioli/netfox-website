import { checkSession, goodiesShop, packDownloadUrl } from '@/lib/goodies';

// Every answer is about one buyer: never cached anywhere.
const NO_STORE = { 'Cache-Control': 'private, no-store' };

/**
 * `/api/goodies/download?session_id=…`: checks with Stripe that the session is
 * a paid checkout of the Goodies link, then redirects to a short-lived URL of
 * the pack. Linked from the thank-you page with a plain `<a>`, never
 * `next/link`, so no RSC fetch ever follows this redirect (see `/download`).
 *
 * `Referrer-Policy: no-referrer` keeps the session id, which is the buyer's
 * key, out of the request to the file host.
 */
export async function GET(request: Request) {
  const shop = goodiesShop();
  if (!shop) {
    return new Response('Not found', { status: 404, headers: NO_STORE });
  }

  const sessionId = new URL(request.url).searchParams.get('session_id') ?? '';
  const check = await checkSession(shop, sessionId);
  if (check !== 'paid') {
    return Response.json(
      { error: check === 'unavailable' ? 'Payment check unavailable, retry shortly' : 'Not paid' },
      { status: check === 'unavailable' ? 503 : 403, headers: NO_STORE }
    );
  }

  const location = await packDownloadUrl(shop);
  if (!location) {
    return Response.json(
      { error: 'Download unavailable, retry shortly' },
      { status: 503, headers: NO_STORE }
    );
  }

  return new Response(null, {
    status: 302,
    headers: { ...NO_STORE, Location: location, 'Referrer-Policy': 'no-referrer' },
  });
}
