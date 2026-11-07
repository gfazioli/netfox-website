/**
 * @jest-environment node
 *
 * The events take a real `Request`, which jsdom does not provide.
 */
import { track } from '@vercel/analytics/server';
import {
  buyerTag,
  DOWNLOAD_EVENT,
  downloadEntry,
  PURCHASE_EVENT,
  recordDownload,
  recordPurchase,
} from './goodies-events';

jest.mock('@vercel/analytics/server', () => ({ track: jest.fn(async () => undefined) }));
const trackMock = track as unknown as jest.Mock;

const SESSION = 'cs_live_a1B2c3D4';
const request = () =>
  new Request(`https://netfox.test/api/goodies/download?session_id=${SESSION}&kind=mac`, {
    headers: {
      'user-agent': 'Safari',
      'x-forwarded-for': '203.0.113.7',
      referer: `https://netfox.test/goodies/thanks?session_id=${SESSION}`,
      cookie: 'a=b',
    },
  });

beforeEach(() => trackMock.mockClear());

describe('buyerTag', () => {
  it('is twelve hex characters, the same for the same session and different across sessions', () => {
    expect(buyerTag(SESSION)).toMatch(/^[0-9a-f]{12}$/);
    expect(buyerTag(SESSION)).toBe(buyerTag(SESSION));
    expect(buyerTag('cs_live_other')).not.toBe(buyerTag(SESSION));
  });

  it('never carries the session id', () => {
    expect(buyerTag(SESSION)).not.toContain('cs_');
    expect(downloadEntry(SESSION, 'v0.2.1', 'mac')).not.toContain(SESSION);
  });
});

describe('downloadEntry', () => {
  it('is buyer, version without its v, and file, separated by spaces', () => {
    expect(downloadEntry(SESSION, 'v0.2.1', 'pictures')).toBe(
      `${buyerTag(SESSION)} 0.2.1 pictures`
    );
    expect(downloadEntry(SESSION, 'unknown', 'mac')).toBe(`${buyerTag(SESSION)} unknown mac`);
  });
});

describe('recording', () => {
  it('counts a download under one property, with a referer that carries no key', async () => {
    await recordDownload(request(), SESSION, 'v0.2.1', 'mac');

    expect(trackMock).toHaveBeenCalledTimes(1);
    const [event, data, options] = trackMock.mock.calls[0];
    expect(event).toBe(DOWNLOAD_EVENT);
    expect(data).toEqual({ download: `${buyerTag(SESSION)} 0.2.1 mac` });
    expect(options.headers).toEqual({
      referer: 'https://netfox.test/goodies/thanks',
      'user-agent': 'Safari',
      'x-forwarded-for': '203.0.113.7',
    });
    expect(JSON.stringify(trackMock.mock.calls)).not.toContain(SESSION);
  });

  it('counts a purchase by its buyer', async () => {
    await recordPurchase(request(), SESSION);

    const [event, data, options] = trackMock.mock.calls[0];
    expect(event).toBe(PURCHASE_EVENT);
    expect(data).toEqual({ buyer: buyerTag(SESSION) });
    expect(options.headers.referer).toBe('https://netfox.test/goodies');
  });

  it('never fails the request when the statistics do', async () => {
    trackMock.mockRejectedValueOnce(new Error('down'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(recordPurchase(request(), SESSION)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
