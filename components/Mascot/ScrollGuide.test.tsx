import { act, fireEvent, render, screen } from '@/test-utils';
import { dismissGuide, guideMemory } from './guide';
import { DELAY_MS, SNIFF_MS } from './HeroGuide';
import {
  CARD_IN_MS,
  CORNER_IN_MS,
  HERO_FOLD_MS,
  LEAVE_MS,
  ScrollGuide,
  SPONSOR_LINE,
  STILL_MS,
} from './ScrollGuide';
import { TRANSLATIONS } from './translations';

describe('ScrollGuide', () => {
  // jsdom has no IntersectionObserver. This one records what each observer
  // watches, so a test can say what came into view and what left it.
  let watches: { callback: IntersectionObserverCallback; targets: Element[] }[];
  let windowWidth: number;

  beforeEach(() => {
    guideMemory.dismissed = false;
    guideMemory.said = -1;
    watches = [];
    windowWidth = 1440;
    globalThis.IntersectionObserver = class {
      callback: IntersectionObserverCallback;
      targets: Element[] = [];
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        watches.push(this);
      }
      observe(target: Element) {
        this.targets.push(target);
      }
      disconnect() {
        this.targets = [];
      }
    } as unknown as typeof IntersectionObserver;
    // jsdom lays nothing out. The row of buttons ends at 990 px, which in a
    // 1440 window leaves the fox beside it the room to come.
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      get: () => windowWidth,
    });
    jest
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({ right: 990 } as DOMRect);
    // Rendered, as far as the focus handoff can tell.
    jest.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
    jest.useFakeTimers();
  });

  afterEach(() => {
    delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
    delete (document.documentElement as { clientWidth?: number }).clientWidth;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const [first, second] = TRANSLATIONS;
  const wait = (ms: number) => act(() => jest.advanceTimersByTime(ms));

  function Page() {
    return (
      <div>
        <a href="/in-view">In view</a>
        <div data-guide-anchor="" />
        <a href="/docs">See what it does</a>
        <ScrollGuide />
        <footer>
          <div id="sponsors">
            <a href="https://github.com/sponsors/gfazioli">Become a sponsor</a>
          </div>
        </footer>
      </div>
    );
  }

  const row = () => document.querySelector('[data-guide-anchor]')!;
  const sponsors = () => document.getElementById('sponsors')!;
  const fire = (target: Element, entry: Partial<IntersectionObserverEntry>) =>
    act(() =>
      watches
        .filter((watch) => watch.targets.includes(target))
        .forEach((watch) =>
          watch.callback(
            [{ target, ...entry } as IntersectionObserverEntry],
            watch as unknown as IntersectionObserver
          )
        )
    );
  const rowOnScreen = () =>
    fire(row(), { isIntersecting: true, boundingClientRect: { bottom: 400 } as DOMRectReadOnly });
  const rowBelow = () =>
    fire(row(), { isIntersecting: false, boundingClientRect: { bottom: 1200 } as DOMRectReadOnly });
  const rowPassed = () =>
    fire(row(), { isIntersecting: false, boundingClientRect: { bottom: -10 } as DOMRectReadOnly });
  const cardShowing = (ratio: number) =>
    fire(sponsors(), { isIntersecting: ratio > 0, intersectionRatio: ratio });

  const corner = () => document.querySelector<HTMLElement>('.corner');
  const onCard = () => sponsors().querySelector<HTMLElement>('.card');
  const fox = () => screen.queryByRole('button', { name: /^Show (a|another) translation$/ });
  const announcer = () => corner()?.querySelector('[aria-live]');

  /** Mounted, a beat later, the buttons scrolled past: it walks into the corner and stands. */
  const inTheCorner = () => {
    render(<Page />);
    wait(DELAY_MS);
    rowPassed();
    wait(CORNER_IN_MS);
    expect(corner()).toHaveAttribute('data-phase', 'here');
  };

  it('stays away until the reader reaches the buttons', () => {
    render(<Page />);
    wait(DELAY_MS);
    rowBelow();
    wait(10_000);
    expect(corner()).toBeNull();
  });

  it('comes to the corner once the buttons are scrolled past, where the fox beside them has room', () => {
    render(<Page />);
    wait(DELAY_MS);
    rowOnScreen();
    wait(10_000);
    // The fox beside the buttons is there: one at a time.
    expect(corner()).toBeNull();

    rowPassed();
    expect(corner()).toHaveAttribute('data-phase', 'arriving');
    wait(CORNER_IN_MS);
    expect(corner()).toHaveAttribute('data-phase', 'here');
    // Folded: past the hero it only rides along.
    expect(screen.queryByText(first.plain)).toBeNull();

    rowOnScreen();
    expect(corner()).toHaveAttribute('data-phase', 'leaving');
    wait(LEAVE_MS);
    expect(corner()).toBeNull();
  });

  it('says the hero’s sentence from the corner where the buttons leave no room, then folds it away', () => {
    windowWidth = 1180;
    render(<Page />);
    wait(DELAY_MS);
    rowOnScreen();
    wait(CORNER_IN_MS);
    expect(screen.queryByText(first.plain)).toBeNull();
    wait(SNIFF_MS);
    expect(screen.getByText(first.plain)).toBeInTheDocument();
    // Arrived on its own, so a screen reader is not interrupted by it.
    expect(announcer()).toHaveTextContent('');
    wait(HERO_FOLD_MS);
    expect(screen.queryByText(first.plain)).toBeNull();
    expect(corner()).toHaveAttribute('data-phase', 'here');
  });

  it('keeps what a reader asked for before it could say the hero’s sentence', () => {
    // Codex, round 1 of #83: a click in the beat before it spoke was replaced
    // by the next translation, and folded on the hero's timer.
    windowWidth = 1180;
    render(<Page />);
    wait(DELAY_MS);
    rowOnScreen();
    wait(CORNER_IN_MS);
    fireEvent.click(fox()!);
    expect(screen.getByText(first.plain)).toBeInTheDocument();
    wait(SNIFF_MS);
    expect(screen.getByText(first.plain)).toBeInTheDocument();
    expect(screen.queryByText(second.plain)).toBeNull();
    wait(HERO_FOLD_MS);
    expect(screen.getByText(first.plain)).toBeInTheDocument();
  });

  it('folds the hero’s sentence as soon as the buttons are scrolled past', () => {
    windowWidth = 1180;
    render(<Page />);
    wait(DELAY_MS);
    rowOnScreen();
    wait(CORNER_IN_MS + SNIFF_MS);
    expect(screen.getByText(first.plain)).toBeInTheDocument();
    rowPassed();
    expect(screen.queryByText(first.plain)).toBeNull();
  });

  it('says the next translation on a click, out loud, and Next goes on', () => {
    inTheCorner();
    expect(fox()).toHaveAccessibleName('Show a translation');
    fireEvent.click(fox()!);
    expect(screen.getByText(first.plain)).toBeInTheDocument();
    expect(announcer()).toHaveTextContent(`${first.raw}: ${first.plain}`);
    expect(fox()).toHaveAccessibleName('Show another translation');

    fireEvent.click(screen.getByRole('button', { name: 'Next translation' }));
    expect(screen.getByText(second.plain)).toBeInTheDocument();
    expect(announcer()).toHaveTextContent(`${second.raw}: ${second.plain}`);
    // Cleared a moment later: the page's text is not said twice to a reader
    // going through it, and the same translation can be said again.
    wait(2000);
    expect(announcer()).toHaveTextContent('');
  });

  it('goes on from where the fox beside the buttons stopped', () => {
    inTheCorner();
    act(() => {
      guideMemory.said = 0;
    });
    fireEvent.click(fox()!);
    expect(screen.getByText(second.plain)).toBeInTheDocument();
  });

  it('walks while the page scrolls, and stands when it stops', () => {
    inTheCorner();
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(corner()).toHaveAttribute('data-moving');
    wait(STILL_MS);
    expect(corner()).not.toHaveAttribute('data-moving');
  });

  it('folds a bubble the reader opened once they scroll half a window on', () => {
    inTheCorner();
    fireEvent.click(fox()!);
    expect(screen.getByText(first.plain)).toBeInTheDocument();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: window.innerHeight });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.queryByText(first.plain)).toBeNull();
    delete (window as { scrollY?: number }).scrollY;
  });

  it('goes to the Support card, in the FAQ’s words, and back to the corner when it has gone', () => {
    inTheCorner();
    cardShowing(0.5);
    expect(corner()).toHaveAttribute('data-phase', 'leaving');
    wait(LEAVE_MS);
    expect(corner()).toBeNull();
    expect(onCard()).toHaveAttribute('data-phase', 'arriving');
    wait(CARD_IN_MS);
    expect(onCard()).toHaveAttribute('data-phase', 'here');
    expect(sponsors()).toHaveTextContent(SPONSOR_LINE);

    // Half out of view, it stays: no back and forth at the edge.
    cardShowing(0.1);
    expect(onCard()).toHaveAttribute('data-phase', 'here');

    cardShowing(0);
    wait(LEAVE_MS);
    expect(onCard()).toBeNull();
    expect(corner()).toHaveAttribute('data-phase', 'arriving');
  });

  it('goes from everywhere when dismissed, and stays gone', () => {
    inTheCorner();
    fireEvent.click(fox()!);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(guideMemory.dismissed).toBe(true);
    wait(LEAVE_MS);
    expect(corner()).toBeNull();
    cardShowing(0.5);
    rowPassed();
    wait(10_000);
    expect(corner()).toBeNull();
    expect(onCard()).toBeNull();
  });

  it('leaves when the fox is dismissed beside the buttons', () => {
    inTheCorner();
    act(() => dismissGuide());
    wait(LEAVE_MS);
    expect(corner()).toBeNull();
  });

  it('hands the keyboard focus to a control in view rather than the one before it', () => {
    // Codex, round 1 of #83: the fox rides in the corner at any height of the
    // page, so the control before it in the markup is usually off screen.
    inTheCorner();
    const inView = screen.getByRole('link', { name: 'In view' });
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect(
      this: Element
    ) {
      return (
        this === inView ? { top: 100, bottom: 120, left: 20, right: 200 } : { right: 990 }
      ) as DOMRect;
    });
    act(() => fox()!.focus());
    rowOnScreen();
    expect(document.activeElement).toBe(inView);
  });

  it('hands the keyboard focus back when it goes', () => {
    inTheCorner();
    act(() => fox()!.focus());
    rowOnScreen();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'See what it does' }));
  });

  it('is out of reach while it fades out', () => {
    inTheCorner();
    rowOnScreen();
    expect(corner()).toHaveAttribute('inert');
  });

  it('arrives standing, and never walks, for a reader who asked for less motion', () => {
    jest.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        }) as unknown as MediaQueryList
    );
    render(<Page />);
    wait(DELAY_MS);
    rowPassed();
    expect(corner()).toHaveAttribute('data-phase', 'here');
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(corner()).not.toHaveAttribute('data-moving');
  });
});
