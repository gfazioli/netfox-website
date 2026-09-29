import { act, fireEvent, render, screen } from '@/test-utils';
import { DELAY_MS, guideMemory, HeroGuide, RESIZE_SETTLE_MS, SNIFF_MS, WALK_MS } from './HeroGuide';
import { TRANSLATIONS } from './translations';

describe('HeroGuide', () => {
  let observers: { callback: IntersectionObserverCallback }[];
  // The window's width and the right edge of the row of buttons, as a
  // 1440-wide window lays the hero out: 314 px left for the bubble.
  let windowWidth: number;

  beforeEach(() => {
    guideMemory.dismissed = false;
    observers = [];
    windowWidth = 1440;
    // jsdom has none. This one only records its callback, so a test can say
    // when the buttons "come into view".
    globalThis.IntersectionObserver = class {
      callback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        observers.push(this);
      }
      observe() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
    // jsdom lays nothing out: every width it reports is 0.
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      get: () => windowWidth,
    });
    jest
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({ right: 990 } as DOMRect);
    jest.useFakeTimers();
  });

  afterEach(() => {
    delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
    delete (document.documentElement as { clientWidth?: number }).clientWidth;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const walker = () => screen.queryByRole('button', { name: /^Show (another|the) translation$/ });
  const phase = () => walker()?.parentElement?.getAttribute('data-phase');
  const said = (text: string) => screen.queryByText(text);
  const [first, second] = TRANSLATIONS;
  const buttonsInView = () =>
    act(() =>
      observers
        .at(-1)
        ?.callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        )
    );
  const wait = (ms: number) => act(() => jest.advanceTimersByTime(ms));
  const arrived = () => {
    buttonsInView();
    wait(DELAY_MS + WALK_MS + SNIFF_MS + 50);
  };

  it('waits for the buttons to come into view, walks in, pings, then translates', () => {
    render(<HeroGuide />);
    wait(10_000);
    expect(walker()).toBeNull();

    buttonsInView();
    wait(DELAY_MS + 50);
    expect(phase()).toBe('walking');
    expect(said(first.plain)).toBeNull();

    wait(WALK_MS);
    expect(phase()).toBe('sniffing');
    expect(said(first.plain)).toBeNull();

    wait(SNIFF_MS);
    expect(phase()).toBe('pointing');
    expect(said(first.raw)).toBeInTheDocument();
    expect(said(first.plain)).toBeInTheDocument();
  });

  it('hands the stylesheet the room it measured for the bubble', () => {
    const { container } = render(<HeroGuide />);
    arrived();
    const anchor = container.querySelector<HTMLElement>('.anchor')!;
    expect(anchor.style.getPropertyValue('--nf-guide-room')).toBe('314px');
  });

  it('does not come where there is no room right of the buttons for what it says', () => {
    windowWidth = 1180;
    render(<HeroGuide />);
    buttonsInView();
    wait(10_000);
    expect(walker()).toBeNull();
  });

  const resizeTo = (width: number) => {
    windowWidth = width;
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
  };

  it('leaves when a resize takes that room away', () => {
    render(<HeroGuide />);
    arrived();
    expect(said(first.plain)).toBeInTheDocument();
    resizeTo(1100);
    expect(walker()).toBeNull();
  });

  it('comes once a window that was too narrow is made wide enough', () => {
    // Review of #82: the buttons came into view in a narrow window, and the
    // observer had already let go, so widening it never brought the fox.
    windowWidth = 1180;
    render(<HeroGuide />);
    buttonsInView();
    wait(10_000);
    expect(walker()).toBeNull();
    resizeTo(1440);
    wait(RESIZE_SETTLE_MS + 50);
    expect(phase()).toBe('walking');
    wait(WALK_MS + SNIFF_MS);
    expect(said(first.plain)).toBeInTheDocument();
  });

  it('walks in again, from the start, when the room comes back mid-walk', () => {
    render(<HeroGuide />);
    buttonsInView();
    wait(DELAY_MS + 1000);
    expect(phase()).toBe('walking');
    resizeTo(1100);
    expect(walker()).toBeNull();
    resizeTo(1440);
    wait(RESIZE_SETTLE_MS + 50);
    expect(phase()).toBe('walking');
    // Where the first walk would have ended: this one is still on its way.
    wait(WALK_MS - 1000);
    expect(phase()).toBe('walking');
    wait(1000 + SNIFF_MS);
    expect(said(first.plain)).toBeInTheDocument();
  });

  it('hands the keyboard focus back before a resize sends it off', () => {
    // Review of #82: the focused control unmounted and the focus fell to the page.
    render(
      <div>
        <a href="/download">Download for macOS</a>
        <a href="/docs">See what it does</a>
        <HeroGuide />
      </div>
    );
    arrived();
    act(() => screen.getByRole('button', { name: 'Dismiss' }).focus());
    resizeTo(1100);
    expect(walker()).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'See what it does' }));
  });

  it('translates the next one on a click on it or on what it says, then starts over', () => {
    render(<HeroGuide />);
    arrived();
    fireEvent.click(walker()!);
    expect(said(second.plain)).toBeInTheDocument();
    expect(said(first.plain)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(second.plain) }));
    expect(said(TRANSLATIONS[2].plain)).toBeInTheDocument();
    for (let i = 3; i <= TRANSLATIONS.length; i += 1) {
      fireEvent.click(walker()!);
    }
    expect(said(first.plain)).toBeInTheDocument();
  });

  it('names the fox for what a click on it does', () => {
    // Round 2 of #82: before it points there is no translation to show
    // "another" of; a click then lands it with the first one.
    render(<HeroGuide />);
    buttonsInView();
    wait(DELAY_MS + 50);
    expect(screen.getByRole('button', { name: 'Show the translation' })).toBeInTheDocument();
    wait(WALK_MS + SNIFF_MS);
    expect(screen.getByRole('button', { name: 'Show another translation' })).toBeInTheDocument();
  });

  it('is out of reach while it fades out', () => {
    // Round 2 of #82: a Tab during the fade landed on a fox about to unmount.
    const { container } = render(<HeroGuide />);
    arrived();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    const hint = container.querySelector('[data-phase]')!;
    expect(hint.getAttribute('data-phase')).toBe('leaving');
    expect(hint).toHaveAttribute('inert');
  });

  it('names what it says for what it does too', () => {
    // The visible "Next" has to be part of the button's name (WCAG 2.5.3).
    render(<HeroGuide />);
    arrived();
    expect(
      screen.getByRole('button', { name: `${first.raw}: ${first.plain} Next` })
    ).toBeInTheDocument();
  });

  it('lands at once when clicked on the way in', () => {
    render(<HeroGuide />);
    buttonsInView();
    wait(DELAY_MS + 50);
    expect(phase()).toBe('walking');
    fireEvent.click(walker()!);
    expect(phase()).toBe('pointing');
    expect(said(first.plain)).toBeInTheDocument();
    // The walk's own timers, still pending, change nothing when they run out.
    wait(WALK_MS + SNIFF_MS);
    expect(phase()).toBe('pointing');
  });

  it('hands the keyboard focus to the button it stood beside when dismissed', () => {
    render(
      <div>
        <a href="/download">Download for macOS</a>
        <a href="/docs">See what it does</a>
        <HeroGuide />
      </div>
    );
    arrived();
    const dismiss = screen.getByRole('button', { name: 'Dismiss' });
    act(() => dismiss.focus());
    fireEvent.click(dismiss);
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'See what it does' }));
  });

  it('leaves when dismissed, and stays gone for the rest of the load', () => {
    const page = render(<HeroGuide />);
    arrived();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    wait(400);
    expect(walker()).toBeNull();
    page.unmount();

    // Off to the docs and back through a link: the home page mounts again.
    render(<HeroGuide />);
    buttonsInView();
    wait(10_000);
    expect(walker()).toBeNull();
  });

  it('comes back on the way home if it was never dismissed', () => {
    const page = render(<HeroGuide />);
    arrived();
    page.unmount();

    render(<HeroGuide />);
    arrived();
    expect(said(first.plain)).toBeInTheDocument();
  });

  it('arrives after the delay where nothing can say the buttons are in view', () => {
    delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
    render(<HeroGuide />);
    wait(DELAY_MS + WALK_MS + SNIFF_MS + 50);
    expect(said(first.plain)).toBeInTheDocument();
  });

  it('stands already pointing, with no walk, for a reader who asked for less motion', () => {
    jest.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        }) as unknown as MediaQueryList
    );
    render(<HeroGuide />);
    buttonsInView();
    wait(DELAY_MS + 50);
    expect(phase()).toBe('pointing');
    expect(said(first.plain)).toBeInTheDocument();
  });
});
