/**
 * @jest-environment node
 *
 * Route handlers build a real `Response`, which jsdom does not provide.
 */
import { GET } from './route';

const ENV = {
  GOODIES_PAYMENT_LINK_URL: 'https://buy.example.test/goodies',
  GOODIES_PAYMENT_LINK_ID: 'plink_goodies',
  GOODIES_RELEASES_REPO: 'owner/goodies',
  GOODIES_GITHUB_TOKEN: 'github-token',
  STRIPE_SECRET_KEY: 'rk_test_key',
};
const SIGNED = 'https://files.example.test/pack.zip?sig=abc';
const request = (query: string) => new Request(`https://netfox.test/api/goodies/download${query}`);

const originalEnv = { ...process.env };
const originalFetch = global.fetch;

/** Stripe answers with `session`; GitHub with one `.zip` asset and its redirect. */
function serve(session: unknown) {
  global.fetch = jest.fn(async (url: string) => {
    if (url.startsWith('https://api.stripe.com/')) {
      return new Response(JSON.stringify(session), { status: 200 });
    }
    if (url.endsWith('/releases/latest')) {
      return new Response(JSON.stringify({ assets: [{ id: 7, name: 'pack.zip' }] }), {
        status: 200,
      });
    }
    return new Response(null, { status: 302, headers: { location: SIGNED } });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  Object.assign(process.env, ENV);
});

afterEach(() => {
  process.env = { ...originalEnv };
  global.fetch = originalFetch;
});

describe('GET /api/goodies/download', () => {
  const paid = { status: 'complete', payment_status: 'paid', payment_link: 'plink_goodies' };

  it('redirects a paid session to the signed URL, never cached, with no referrer', async () => {
    serve(paid);

    const response = await GET(request('?session_id=cs_test_abc'));

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe(SIGNED);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
  });

  it('refuses a session paid through another link', async () => {
    serve({ ...paid, payment_link: 'plink_coffee' });

    const response = await GET(request('?session_id=cs_test_abc'));

    expect(response.status).toBe(403);
    expect(response.headers.get('Location')).toBeNull();
  });

  it('refuses a request without a session id', async () => {
    serve(paid);

    expect((await GET(request(''))).status).toBe(403);
  });

  it('does not exist where the shop is not configured', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    serve(paid);

    expect((await GET(request('?session_id=cs_test_abc'))).status).toBe(404);
  });
});
