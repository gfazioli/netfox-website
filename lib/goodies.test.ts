/**
 * @jest-environment node
 *
 * The helpers build real `Response`s and read their headers, which jsdom does
 * not provide.
 */
import {
  checkSession,
  goodiesShop,
  isSessionId,
  packDownloadUrl,
  type GoodiesShop,
} from './goodies';

const SHOP: GoodiesShop = {
  paymentLinkUrl: 'https://buy.example.test/goodies',
  paymentLinkId: 'plink_goodies',
  releasesRepo: 'owner/goodies',
  githubToken: 'github-token',
  stripeKey: 'rk_test_key',
  assetSuffix: '.zip',
};

const SESSION = 'cs_test_a1B2c3';
const SIGNED = 'https://files.example.test/pack.zip?sig=abc';

function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers });
}

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
});

describe('goodiesShop', () => {
  const full = {
    GOODIES_PAYMENT_LINK_URL: SHOP.paymentLinkUrl,
    GOODIES_PAYMENT_LINK_ID: SHOP.paymentLinkId,
    GOODIES_RELEASES_REPO: SHOP.releasesRepo,
    GOODIES_GITHUB_TOKEN: SHOP.githubToken,
    STRIPE_SECRET_KEY: SHOP.stripeKey,
  } as unknown as NodeJS.ProcessEnv;

  it('is open only when every value is set', () => {
    expect(goodiesShop(full)).toEqual(SHOP);
    for (const key of Object.keys(full)) {
      expect(goodiesShop({ ...full, [key]: '' })).toBeNull();
    }
  });

  it('reads the asset suffix, case-insensitively', () => {
    expect(goodiesShop({ ...full, GOODIES_ASSET_SUFFIX: '.DMG' })?.assetSuffix).toBe('.dmg');
  });
});

describe('isSessionId', () => {
  it('accepts Checkout Session ids only', () => {
    expect(isSessionId('cs_test_a1B2c3')).toBe(true);
    expect(isSessionId('cs_live_a1B2c3')).toBe(true);
    for (const bad of ['', 'cs_test_', 'cs_test_../x', 'pi_123', 'cs_test_a?b=1', 42]) {
      expect(isSessionId(bad)).toBe(false);
    }
  });
});

describe('checkSession', () => {
  const paid = { status: 'complete', payment_status: 'paid', payment_link: SHOP.paymentLinkId };

  it('says paid for a completed, paid session of this link', async () => {
    const fetchMock = jest.fn(async () => json(200, paid));
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(checkSession(SHOP, SESSION)).resolves.toBe('paid');
    expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toBe(
      `https://api.stripe.com/v1/checkout/sessions/${SESSION}`
    );
  });

  it('refuses a session paid through another link, such as the coffee one', async () => {
    global.fetch = jest.fn(async () =>
      json(200, { ...paid, payment_link: 'plink_coffee' })
    ) as unknown as typeof fetch;

    await expect(checkSession(SHOP, SESSION)).resolves.toBe('unpaid');
  });

  it('refuses a session that is open or unpaid', async () => {
    global.fetch = jest.fn(async () =>
      json(200, { ...paid, status: 'open', payment_status: 'unpaid' })
    ) as unknown as typeof fetch;

    await expect(checkSession(SHOP, SESSION)).resolves.toBe('unpaid');
  });

  it('says unpaid for an unknown session, unavailable when Stripe fails', async () => {
    global.fetch = jest.fn(async () => json(404, {})) as unknown as typeof fetch;
    await expect(checkSession(SHOP, SESSION)).resolves.toBe('unpaid');

    global.fetch = jest.fn(async () => json(500, {})) as unknown as typeof fetch;
    await expect(checkSession(SHOP, SESSION)).resolves.toBe('unavailable');

    global.fetch = jest.fn(async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;
    await expect(checkSession(SHOP, SESSION)).resolves.toBe('unavailable');
  });

  it('never asks Stripe about something that is not a session id', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(checkSession(SHOP, '../../v1/charges')).resolves.toBe('unpaid');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('packDownloadUrl', () => {
  function github(assets: unknown, assetStatus = 302) {
    return jest.fn(async (url: string) =>
      url.endsWith('/releases/latest')
        ? json(200, { assets })
        : new Response(null, { status: assetStatus, headers: { location: SIGNED } })
    );
  }

  it('resolves the asset with the configured suffix to its signed URL', async () => {
    const fetchMock = github([
      { id: 1, name: 'SHA256SUMS.txt' },
      { id: 2, name: 'Netfox-Goodies-1.0.ZIP' },
    ]);
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(packDownloadUrl(SHOP)).resolves.toBe(SIGNED);
    const [assetUrl, init] = fetchMock.mock.calls[1] as unknown as [string, RequestInit];
    expect(assetUrl).toBe('https://api.github.com/repos/owner/goodies/releases/assets/2');
    expect(init.redirect).toBe('manual');
  });

  it('gives nothing when the release has no such asset or GitHub fails', async () => {
    global.fetch = github([{ id: 1, name: 'NetfoxDrift.dmg' }]) as unknown as typeof fetch;
    await expect(packDownloadUrl(SHOP)).resolves.toBeNull();

    global.fetch = github([{ id: 2, name: 'pack.zip' }], 404) as unknown as typeof fetch;
    await expect(packDownloadUrl(SHOP)).resolves.toBeNull();

    global.fetch = jest.fn(async () => json(404, {})) as unknown as typeof fetch;
    await expect(packDownloadUrl(SHOP)).resolves.toBeNull();
  });
});
