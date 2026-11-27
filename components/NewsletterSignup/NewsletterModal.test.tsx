import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Profiler } from 'react';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { act, cleanup, fireEvent, render, screen } from '@/test-utils';
import { NewsletterModal } from './NewsletterModal';
import { closedRecently, DISMISSED_KEY, PROMPT_OPEN_ATTRIBUTE } from './prompt-open';

/** The promise, written out here rather than read from the code it checks. */
const DAY = 24 * 60 * 60 * 1000;

// The page the prompt opens on: the shop's own pages leave the Goodies out.
let mockPathname = '/';
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: () => mockPathname,
}));
/**
 * A router, so Link handles a click as on the site rather than leaving it to
 * the browser. Jest loads the Pages Router's Link for `next/link` (the site's
 * bundler picks the App Router's, which needs React's server runtime to load):
 * both leave a modified click to the browser and call `onNavigate` for a plain
 * one, before they move.
 */
const router = {
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  prefetch: jest.fn(() => Promise.resolve()),
};
const withRouter = (ui: React.ReactElement) => (
  <RouterContext.Provider value={router as never}>{ui}</RouterContext.Provider>
);

/*
 * The prompt watches the scroll on every page of the site, so what it costs
 * per scroll event is the point: it used to render on each one, forever.
 * Frames are queued by hand, so a test says exactly when the check runs.
 */
describe('NewsletterModal', () => {
  let frames: Map<number, FrameRequestCallback>;
  let nextFrame: number;

  const runFrames = () =>
    act(() => {
      const due = [...frames.values()];
      frames.clear();
      due.forEach((callback) => callback(performance.now()));
    });

  // A plain, writable property in jsdom.
  const setScrollY = (y: number) => {
    (window as { scrollY: number }).scrollY = y;
  };

  const scrollTo = (y: number) => {
    setScrollY(y);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
  };

  const isOpen = () => document.documentElement.hasAttribute(PROMPT_OPEN_ATTRIBUTE);
  // The dialog is a chunk of its own, loaded when the prompt opens: a test
  // that opens it waits for it to land. The wait gets 3 s, not
  // `findByRole`'s 1 s. On an idle machine the first test waited 65 ms and
  // the others 6 ms. A machine busy running the rest of the suite stretched
  // a cold import of the chunk from 125 ms to 4.8 s, and the first test
  // failed with nothing on the page, on main too.
  const dialog = () => screen.findByRole('dialog', {}, { timeout: 3_000 });
  // What a test that expects the prompt to stay closed waits for: the chunk a
  // wrong opening would have asked for, and the render that would follow it.
  // Asserted at once, a prompt opening by mistake had not arrived yet.
  const settle = () =>
    act(async () => {
      await import('./PromptDialog');
    });
  const openPrompt = () => {
    scrollTo(1300);
    runFrames();
    return dialog();
  };

  // The chunk is loaded once before any test, so the first wait no longer
  // includes loading it: 27 ms instead of 65 ms on an idle machine. The rest
  // is the dialog's first render. The hook gets a time limit of its own,
  // because it pays the load that used to fall inside a test.
  beforeAll(() => import('./PromptDialog'), 30_000);

  beforeEach(() => {
    mockPathname = '/';
    router.push.mockClear();
    localStorage.clear();
    frames = new Map();
    nextFrame = 1;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.set(nextFrame, callback);
      return nextFrame++;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      frames.delete(id);
    });
    setScrollY(0);
  });

  afterEach(() => {
    // Unmounted while the doubles are still in place: its cleanup cancels a
    // frame the mock queued, which the real cancelAnimationFrame never issued.
    cleanup();
    jest.restoreAllMocks();
  });

  it('opens once the page has scrolled past 1200px, and not before', async () => {
    render(<NewsletterModal />);
    scrollTo(1000);
    runFrames();
    expect(isOpen()).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();

    await openPrompt();
    expect(isOpen()).toBe(true);
  });

  it('is a dialog with a name of its own', async () => {
    render(<NewsletterModal />);
    expect(await openPrompt()).toHaveAccessibleName('The Netfox newsletter and Goodies');
    // Where the focus lands as it opens.
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  it('reads the scroll at most once a frame', () => {
    render(<NewsletterModal />);
    runFrames();
    for (let y = 100; y <= 1000; y += 100) {
      scrollTo(y);
    }
    expect(frames.size).toBe(1);
  });

  it('stops watching the scroll once it has opened', async () => {
    render(<NewsletterModal />);
    await openPrompt();
    expect(isOpen()).toBe(true);

    // The open modal queues frames of its own; a scroll must add none.
    const queued = frames.size;
    scrollTo(2000);
    expect(frames.size).toBe(queued);
  });

  it('opens on a page that loads already past the trigger', async () => {
    setScrollY(3000);
    render(<NewsletterModal />);
    runFrames();
    await dialog();
    expect(isOpen()).toBe(true);
  });

  it('remembers when the visitor closed it', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_800_000_000_000);
    render(<NewsletterModal />);
    fireEvent.keyDown(await openPrompt(), { key: 'Escape' });
    expect(localStorage.getItem(DISMISSED_KEY)).toBe('1800000000000');
  });

  it('stays closed for a day after the visitor closed it', async () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now() - DAY + 60_000));
    render(<NewsletterModal />);
    scrollTo(1300);
    runFrames();
    await settle();
    expect(isOpen()).toBe(false);
    expect(frames.size).toBe(0);
  });

  it('opens again once a day has passed since the visitor closed it', async () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now() - DAY - 60_000));
    render(<NewsletterModal />);
    await openPrompt();
    expect(isOpen()).toBe(true);
  });

  it('opens for a visitor who closed it for good in an earlier version', async () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    render(<NewsletterModal />);
    await openPrompt();
    expect(isOpen()).toBe(true);
  });

  it('reads a closing time, a missing one, an old flag and a clock set back', () => {
    const now = 1_800_000_000_000;
    expect(closedRecently(String(now - 1000), now)).toBe(true);
    expect(closedRecently(String(now - DAY + 1), now)).toBe(true);
    expect(closedRecently(String(now - DAY), now)).toBe(false);
    expect(closedRecently(null, now)).toBe(false);
    expect(closedRecently('', now)).toBe(false);
    expect(closedRecently('true', now)).toBe(false);
    expect(closedRecently(String(now + 60_000), now)).toBe(false);
  });

  it('shows the Goodies under the newsletter, and closes as it goes to them', async () => {
    render(withRouter(<NewsletterModal />));
    await openPrompt();
    const goodies = screen.getByRole('link', { name: /See the Goodies/ });
    expect(goodies).toHaveAttribute('href', '/goodies');
    expect(screen.getByRole('link', { name: /Subscribe for updates/ })).toBeInTheDocument();

    fireEvent.click(goodies);
    expect(router.push).toHaveBeenCalledWith('/goodies', expect.anything());
    expect(isOpen()).toBe(false);
    expect(closedRecently(localStorage.getItem(DISMISSED_KEY), Date.now())).toBe(true);
  });

  it('stays open when the Goodies open in a new tab', async () => {
    render(withRouter(<NewsletterModal />));
    await openPrompt();
    const goodies = screen.getByRole('link', { name: /See the Goodies/ });
    // The browser's new tab, which jsdom cannot open: cancelled on the
    // document, once React's handler on the root below it has seen the click
    // as it came.
    document.addEventListener('click', (event) => event.preventDefault(), { once: true });
    fireEvent.click(goodies, { metaKey: true });
    expect(isOpen()).toBe(true);
    expect(localStorage.getItem(DISMISSED_KEY)).toBeNull();
  });

  it('opens again, a day after it was closed, in the tab it was closed in', async () => {
    const { rerender } = render(<NewsletterModal />);
    fireEvent.keyDown(await openPrompt(), { key: 'Escape' });
    expect(isOpen()).toBe(false);

    // The same tab, the next day: a link to another page of the site.
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + DAY);
    mockPathname = '/docs';
    rerender(
      <>
        <NewsletterModal />
      </>
    );
    setScrollY(0);
    await openPrompt();
    expect(isOpen()).toBe(true);
  });

  it('opens on a later page of a tab left open since the visitor closed it', async () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now() - 60_000));
    const { rerender } = render(<NewsletterModal />);
    scrollTo(1300);
    runFrames();
    expect(isOpen()).toBe(false);

    // The next day, in the same tab: a link to another page of the site.
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + DAY);
    mockPathname = '/docs';
    // In the fragment `test-utils` put the first render in: without it, the
    // prompt would mount anew and pass this without the recheck.
    rerender(
      <>
        <NewsletterModal />
      </>
    );
    setScrollY(0);
    await openPrompt();
    expect(isOpen()).toBe(true);
  });

  it('leaves the Goodies out on the shop’s own pages', async () => {
    mockPathname = '/goodies/licence';
    render(<NewsletterModal />);
    expect(await openPrompt()).toHaveAccessibleName('Subscribe to the Netfox newsletter');
    expect(screen.queryByRole('link', { name: /See the Goodies/ })).toBeNull();
  });

  it('opens at most once per page load, even where storage refuses the answer', async () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(<NewsletterModal />);
    fireEvent.keyDown(await openPrompt(), { key: 'Escape' });
    expect(isOpen()).toBe(false);

    scrollTo(1600);
    runFrames();
    expect(isOpen()).toBe(false);
  });

  it('imports the dialog only when it opens, never with the page', () => {
    // A value import would put Mantine's Modal back into every page's script.
    const source = readFileSync(join(__dirname, 'NewsletterModal.tsx'), 'utf8');
    expect(source).not.toMatch(/^import (?!type )[^;]*from '\.\/PromptDialog';/m);
    expect(source).toContain("import('./PromptDialog')");
  });

  it('is the key the capture tool writes to keep it out of what it sees', () => {
    const shot = readFileSync(join(__dirname, '../../scripts/shot.mjs'), 'utf8');
    expect(shot).toContain(`const PROMPT_KEY = '${DISMISSED_KEY}';`);
    // A closing time, which the prompt reads as closed: a `true` no longer is.
    expect(shot).toContain(
      'localStorage.setItem(${JSON.stringify(PROMPT_KEY)}, String(Date.now()))'
    );
  });

  it('stays closed when the visitor closed it in another tab since the page loaded', async () => {
    render(<NewsletterModal />);
    runFrames();
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    scrollTo(1300);
    runFrames();
    await settle();
    expect(isOpen()).toBe(false);
  });

  it('renders nothing for a scroll once the visitor has closed it', () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    let commits = 0;
    render(
      <Profiler id="prompt" onRender={() => commits++}>
        <NewsletterModal />
      </Profiler>
    );
    runFrames();
    commits = 0;

    for (let y = 100; y <= 3000; y += 100) {
      scrollTo(y);
    }
    // No watcher at all: a scroll queues no frame to read it in.
    expect(frames.size).toBe(0);
    runFrames();
    expect(commits).toBe(0);
    expect(isOpen()).toBe(false);
  });
});
