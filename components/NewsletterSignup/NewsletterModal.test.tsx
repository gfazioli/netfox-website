import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Profiler } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@/test-utils';
import { NewsletterModal } from './NewsletterModal';
import { DISMISSED_KEY, PROMPT_OPEN_ATTRIBUTE } from './prompt-open';

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
    expect(await openPrompt()).toHaveAccessibleName('Subscribe to the Netfox newsletter');
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

  it('remembers that the visitor closed it', async () => {
    render(<NewsletterModal />);
    fireEvent.keyDown(await openPrompt(), { key: 'Escape' });
    expect(localStorage.getItem(DISMISSED_KEY)).toBe('true');
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
    expect(readFileSync(join(__dirname, '../../scripts/shot.mjs'), 'utf8')).toContain(
      `const PROMPT_KEY = '${DISMISSED_KEY}';`
    );
  });

  it('stays closed when the visitor closed it in another tab since the page loaded', () => {
    render(<NewsletterModal />);
    runFrames();
    localStorage.setItem(DISMISSED_KEY, 'true');
    scrollTo(1300);
    runFrames();
    expect(isOpen()).toBe(false);
  });

  it('renders nothing for a scroll once the visitor has closed it', () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
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
    runFrames();
    expect(commits).toBe(0);
    expect(frames.size).toBe(0);
    expect(isOpen()).toBe(false);
  });
});
