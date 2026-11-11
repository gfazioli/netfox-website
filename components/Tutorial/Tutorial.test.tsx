import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { act } from 'react';
import { fireEvent, render, screen } from '@/test-utils';
import { Tutorial } from './Tutorial';
import { clock, isoDuration, TUTORIALS, twoDigits } from './tutorials';

const ROOT = join(__dirname, '..', '..');

// Nextra ships ESM that Jest does not transform; the player takes only
// `docsSizes` from DocsImage, which does not need it.
jest.mock('nextra/components', () => ({ ImageZoom: () => null }), { virtual: true });

describe('Tutorial', () => {
  it('shows the poster as a link to the film, and loads nothing from YouTube', () => {
    const { container } = render(<Tutorial n={1} />);
    const link = screen.getByRole('link', {
      name: /Play Netfox Tutorial 01: Name unknown devices/,
    });
    expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=rGAKkh0wSEk');
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy');
  });

  it('puts the player in its place on a click, playing, with the focus in it', () => {
    const { container } = render(<Tutorial n={1} />);
    fireEvent.click(screen.getByRole('link', { name: /Play Netfox Tutorial 01/ }));
    const frame = container.querySelector('iframe')!;
    expect(frame.src).toBe(
      'https://www.youtube-nocookie.com/embed/rGAKkh0wSEk?autoplay=1&rel=0&enablejsapi=1&origin=http%3A%2F%2Flocalhost'
    );
    expect(frame.title).toBe('Netfox Tutorial 01: Name unknown devices on your network (1:04)');
    expect(frame).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    expect(document.activeElement).toBe(frame);
  });

  it("turns the player's captions off once the film plays, listening to that frame only", () => {
    jest.useFakeTimers();
    const { container } = render(<Tutorial n={1} />);
    fireEvent.click(screen.getByRole('link', { name: /Play Netfox Tutorial 01/ }));
    const frame = container.querySelector('iframe')!;
    const post = jest.spyOn(frame.contentWindow!, 'postMessage').mockImplementation(() => {});
    const sent = () => post.mock.calls.map(([m]) => JSON.parse(m as string));
    const hear = (data: object, source: Window | null = frame.contentWindow) =>
      act(() => {
        window.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(data), source }));
      });

    act(() => {
      jest.advanceTimersByTime(600);
    });
    expect(sent().filter((m) => m.event === 'listening').length).toBeGreaterThan(1);

    // Another window saying the film plays is not this player.
    hear({ event: 'infoDelivery', info: { playerState: 1 } }, window);
    expect(sent().some((m) => m.func === 'unloadModule')).toBe(false);

    hear({ event: 'infoDelivery', info: { playerState: 3 } });
    expect(sent().some((m) => m.func === 'unloadModule')).toBe(false);
    hear({ event: 'infoDelivery', info: { playerState: 1 } });
    hear({ event: 'infoDelivery', info: { playerState: 1 } });
    expect(sent().filter((m) => m.func === 'unloadModule')).toEqual([
      { event: 'command', func: 'unloadModule', args: ['captions'], id: 1, channel: 'widget' },
    ]);

    // The player answered: the handshake stops.
    const knocks = sent().filter((m) => m.event === 'listening').length;
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(sent().filter((m) => m.event === 'listening').length).toBe(knocks);
    jest.useRealTimers();
  });

  it('lets a click with a modifier open YouTube, as the reader asked', () => {
    const { container } = render(<Tutorial n={1} />);
    const link = screen.getByRole('link', { name: /Play Netfox Tutorial 01/ });
    const notCancelled = fireEvent.click(link, { metaKey: true });
    expect(notCancelled).toBe(true);
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('describes the film for search in the served markup', () => {
    const { container } = render(<Tutorial n={1} />);
    const json = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!
    );
    expect(json).toMatchObject({
      '@type': 'VideoObject',
      name: 'Name unknown devices on your network | Netfox Tutorial 01',
      thumbnailUrl: 'https://netfox.app/tutorials/netfox-tutorial-01.jpg',
      uploadDate: '2026-11-11T11:09:00+01:00',
      duration: 'PT1M3S',
      embedUrl: 'https://www.youtube-nocookie.com/embed/rGAKkh0wSEk',
    });
    expect(container.querySelector('figcaption')!.textContent).toBe(
      'Netfox Tutorial 01 · Name unknown devices on your network · 1:04 · All the tutorials'
    );
  });

  it('refuses a number with no film', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tutorial n={11} />)).toThrow('No Netfox tutorial numbered 11');
  });
});

describe('the series', () => {
  it('is numbered 1 to 10, one film each, each with its poster', () => {
    expect(TUTORIALS.map((t) => t.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(new Set(TUTORIALS.map((t) => t.id)).size).toBe(TUTORIALS.length);
    for (const t of TUTORIALS) {
      expect(
        existsSync(join(ROOT, 'public', 'tutorials', `netfox-tutorial-${twoDigits(t.n)}.jpg`))
      ).toBe(true);
    }
  });

  it('goes out in order, on dates a browser can read', () => {
    const times = TUTORIALS.map((t) => Date.parse(t.published));
    expect(times.every(Number.isFinite)).toBe(true);
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it('writes a length the way YouTube and schema.org do', () => {
    expect(clock(63.4)).toBe('1:04');
    expect(clock(80.1)).toBe('1:21');
    expect(clock(84.0)).toBe('1:24');
    expect(isoDuration(63.4)).toBe('PT1M3S');
  });
});

/** Every `<Tutorial n={N} />` in the docs, with the page it is on. */
function embeds(): { n: number; page: string }[] {
  const found: { n: number; page: string }[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        walk(path);
      } else if (name.endsWith('.mdx')) {
        for (const m of readFileSync(path, 'utf8').matchAll(/<Tutorial\s+n=\{(\d+)\}/g)) {
          found.push({ n: Number(m[1]), page: path.slice(ROOT.length + 1) });
        }
      }
    }
  };
  walk(join(ROOT, 'content'));
  return found;
}

// A film is private until it goes out, and an embed of it says "Video
// unavailable": a page takes a film on the day it is published, not before.
describe('the docs', () => {
  const pages = embeds();

  it('embed at least one film (the net is looking in the right place)', () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it.each(pages)('embed film $n on $page only once it is public', ({ n }) => {
    const film = TUTORIALS.find((t) => t.n === n);
    expect(film).toBeDefined();
    expect(Date.parse(film!.published)).toBeLessThanOrEqual(Date.now());
  });

  it('embed each film once', () => {
    const numbers = pages.map((p) => p.n);
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});
