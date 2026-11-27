import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@/test-utils';
import { Welcome } from './Welcome';

describe('Welcome component', () => {
  it('renders the hero title', () => {
    render(<Welcome />);
    expect(screen.getByText(/^your network,/i)).toBeInTheDocument();
  });

  it('places the hero glows from the top in rem, never as a share of the height (#158)', () => {
    // The section grows while the page arrives, and a glow at a % of its
    // height moves with it: up to 0.6 of layout shift on a phone.
    const { container } = render(<Welcome />);
    const glows = [...container.querySelectorAll<HTMLElement>('.nf-home .mantine-Scene-glow')];
    expect(glows.map((glow) => glow.style.top)).toEqual([
      'var(--nf-glow-high-top)',
      'var(--nf-glow-low-top)',
    ]);
    // The section carries the class that sets them, and every value is rem:
    // without it the glows fall back to `top: auto` and pile at the top.
    expect(container.querySelector('.nf-home')).toHaveClass('glows');
    const css = readFileSync(join(__dirname, 'Welcome.module.css'), 'utf8');
    const values = [...css.matchAll(/--nf-glow-(?:high|low)-top:\s*([^;]+);/g)].map((m) => m[1]);
    expect(values).toHaveLength(6);
    expect(values.every((value) => /^[\d.]+rem$/.test(value))).toBe(true);
  });
});
