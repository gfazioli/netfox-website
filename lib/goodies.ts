/**
 * Netfox Goodies: a paid pack of extras (the Netfox Drift screen saver,
 * wallpapers), sold through a Stripe Payment Link with Managed Payments, so
 * Stripe is the merchant of record, and delivered from the latest release of a
 * private repository.
 *
 * Every value that names the shop comes from the environment. This public
 * repository then carries no private repository name or account id, and the
 * shop's pages answer 404 wherever a value is missing (production, until the
 * shop opens):
 *
 * - `GOODIES_PAYMENT_LINK_URL`: the Payment Link the Buy button opens.
 * - `GOODIES_PAYMENT_LINK_ID`: its id (`plink_…`). The account has other links,
 *   the coffee one among them, and a session paid through any of them must not
 *   unlock the download.
 * - `GOODIES_RELEASES_REPO`: `owner/name` of the private repository.
 * - `GOODIES_GITHUB_TOKEN`: a fine-grained token with Contents: Read on that
 *   repository only.
 * - `STRIPE_SECRET_KEY`: a restricted key with Checkout Sessions: Read only.
 * - `GOODIES_ASSET_SUFFIX` (optional, default `.zip`): which asset of the
 *   release is the pack.
 */
export interface GoodiesShop {
  paymentLinkUrl: string;
  paymentLinkId: string;
  releasesRepo: string;
  githubToken: string;
  stripeKey: string;
  assetSuffix: string;
}

export function goodiesShop(env: NodeJS.ProcessEnv = process.env): GoodiesShop | null {
  const paymentLinkUrl = env.GOODIES_PAYMENT_LINK_URL;
  const paymentLinkId = env.GOODIES_PAYMENT_LINK_ID;
  const releasesRepo = env.GOODIES_RELEASES_REPO;
  const githubToken = env.GOODIES_GITHUB_TOKEN;
  const stripeKey = env.STRIPE_SECRET_KEY;
  if (!paymentLinkUrl || !paymentLinkId || !releasesRepo || !githubToken || !stripeKey) {
    return null;
  }
  return {
    paymentLinkUrl,
    paymentLinkId,
    releasesRepo,
    githubToken,
    stripeKey,
    assetSuffix: (env.GOODIES_ASSET_SUFFIX || '.zip').toLowerCase(),
  };
}

const FETCH_TIMEOUT_MS = 10_000;

/** A Checkout Session id, checked before it goes into a Stripe URL path. */
const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{1,256}$/;

export function isSessionId(value: unknown): value is string {
  return typeof value === 'string' && SESSION_ID.test(value);
}

/**
 * `unavailable` is kept apart from `unpaid` so the thank-you page can tell a
 * buyer to retry in a moment rather than that we have no record of the payment.
 */
export type SessionCheck = 'paid' | 'unpaid' | 'unavailable';

/**
 * Whether `sessionId` is a completed, paid checkout of the Goodies link.
 *
 * Asked of Stripe on every call and never cached: it is the download's only
 * gate. The session id is the buyer's key, carried in the thank-you page's URL;
 * whoever holds it can download, like a download link. A later refund does not
 * revoke it: the session stays `paid`, and the files are already out.
 */
export async function checkSession(shop: GoodiesShop, sessionId: string): Promise<SessionCheck> {
  if (!isSessionId(sessionId)) {
    return 'unpaid';
  }
  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${shop.stripeKey}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (response.status === 404) {
      return 'unpaid';
    }
    if (!response.ok) {
      return 'unavailable';
    }
    const session = await response.json();
    return session?.status === 'complete' &&
      session?.payment_status === 'paid' &&
      session?.payment_link === shop.paymentLinkId
      ? 'paid'
      : 'unpaid';
  } catch {
    return 'unavailable';
  }
}

/**
 * A short-lived URL of the pack: the latest release's asset ending in
 * `assetSuffix`, as GitHub's signed storage redirect.
 *
 * The asset endpoint answers a token-bearing request with a 302 to a URL that
 * works without credentials for a few minutes, so the file never passes
 * through this site and the URL is useless once shared late. `latest` skips
 * drafts and pre-releases: a draft is invisible to a read-only token anyway.
 */
export async function packDownloadUrl(shop: GoodiesShop): Promise<string | null> {
  const api = `https://api.github.com/repos/${shop.releasesRepo}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${shop.githubToken}`,
    'User-Agent': 'netfox-website',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  try {
    const release = await fetch(`${api}/releases/latest`, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!release.ok) {
      return null;
    }
    const { assets } = await release.json();
    const pack = Array.isArray(assets)
      ? assets.find(
          (a: { name?: unknown }) =>
            typeof a?.name === 'string' && a.name.toLowerCase().endsWith(shop.assetSuffix)
        )
      : undefined;
    if (typeof pack?.id !== 'number') {
      return null;
    }
    const asset = await fetch(`${api}/releases/assets/${pack.id}`, {
      headers: { ...headers, Accept: 'application/octet-stream' },
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const location = asset.headers.get('location');
    return asset.status >= 300 && asset.status < 400 && location?.startsWith('https://')
      ? location
      : null;
  } catch {
    return null;
  }
}
