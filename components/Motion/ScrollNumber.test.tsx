import { render, screen } from '@/test-utils';
import { ScrollNumber } from './ScrollNumber';

describe('ScrollNumber', () => {
  it('has the value as its only text, whatever rolls behind it', () => {
    // The strip of 0-9 behind each digit is generated content: a crawler, a
    // screen reader or a copy-paste has to get "100%", not "0123456789...".
    // Wrapped, because the provider in test-utils injects a <style> whose text
    // would otherwise count as the container's.
    render(
      <div data-testid="n">
        <ScrollNumber value="100%" />
      </div>
    );
    expect(screen.getByTestId('n').textContent).toBe('100%');
  });

  it('gives each digit a strip aimed at that digit, in reading order', () => {
    const { container } = render(<ScrollNumber value="47" />);
    const strips = [...container.querySelectorAll<HTMLElement>('[style*="--d"]')];
    expect(strips.map((s) => s.style.getPropertyValue('--d'))).toEqual(['4', '7']);
    expect(strips.map((s) => s.style.getPropertyValue('--i'))).toEqual(['0', '1']);
  });

  it('renders a value with no digits as plain text', () => {
    render(
      <div data-testid="n">
        <ScrollNumber value="Opt-in" />
      </div>
    );
    expect(screen.getByTestId('n').textContent).toBe('Opt-in');
    expect(screen.getByTestId('n').querySelector('[style*="--d"]')).toBeNull();
  });

  it('is revealed at once where nothing can observe it scrolling in', () => {
    // jsdom has no IntersectionObserver: a reveal that cannot fire must not
    // leave the number parked at zero.
    const { container } = render(<ScrollNumber value="5" />);
    expect(container.querySelector('[data-revealed]')).not.toBeNull();
  });
});
