import { render, screen, within } from '@/test-utils';
import config from '@/config';
import { MantineFooter } from './MantineFooter';

/**
 * The publisher line is a legal requirement, not decoration: the VAT number on
 * every page (art. 35 DPR 633/72) and the legal notice reachable from every
 * page (art. 7 D.Lgs. 70/2003). It is read from `config.legal`, so this pins
 * the text the reader actually gets, whitespace included -- a space lost
 * between JSX chunks would join the owner to the VAT number.
 */
describe('MantineFooter publisher line', () => {
  it('names the brand, the owner and the VAT number', () => {
    render(<MantineFooter year={2026} />);
    const line = screen.getByText(/P\.IVA/).closest('p');
    expect(line?.textContent).toBe(
      `© 2026 ${config.legal.brand} — ${config.legal.owner}·P.IVA ${config.legal.vatNumber}·Legal·Privacy·Terms`
    );
  });

  it('links to the legal notice, the privacy policy and the terms of use', () => {
    render(<MantineFooter year={2026} />);
    // Scoped to the line: a footer column may carry a Privacy link of its own.
    const line = screen.getByText(/P\.IVA/).closest('p') as HTMLElement;
    expect(within(line).getByRole('link', { name: 'Legal' })).toHaveAttribute(
      'href',
      '/docs/legal'
    );
    expect(within(line).getByRole('link', { name: 'Privacy' })).toHaveAttribute(
      'href',
      '/docs/privacy'
    );
    expect(within(line).getByRole('link', { name: 'Terms' })).toHaveAttribute(
      'href',
      '/docs/terms'
    );
  });
});

/**
 * The icon row ends with the newsletter, Netfox's own Substack publication
 * (`config.community.newsletter`): an earlier cross-port of a sibling's footer
 * pointed this icon at a page that answered 404, before Netfox had one. The
 * YouTube icon is Netfox's own channel, never the author's personal one: the
 * URL is pinned here, not read back from `config`.
 */
describe('MantineFooter social links', () => {
  it("lists the icon row in order, with Netfox's own YouTube channel and its newsletter", () => {
    render(<MantineFooter year={2026} />);
    // The icon row, found through its first icon: the text above it links to
    // Discord too.
    const icons = screen.getByRole('link', { name: 'GitHub' }).parentElement as HTMLElement;
    expect(
      within(icons)
        .getAllByRole('link')
        .map((link) => link.getAttribute('aria-label'))
    ).toEqual(['GitHub', 'X', 'Discord', 'YouTube', 'Newsletter']);
    expect(within(icons).getByRole('link', { name: 'YouTube' })).toHaveAttribute(
      'href',
      'https://www.youtube.com/@Netfox-app'
    );
  });
});

/**
 * The footer's "Listed on" row carries every directory badge but Product
 * Hunt's (that one is under the hero). A directory verifies its badge on the
 * home page, which this footer closes.
 */
describe('MantineFooter directory badges', () => {
  it('links every footer directory under the Support card, and draws no row when there is none', () => {
    render(<MantineFooter year={2026} />);
    const footerBadges = config.directoryBadges.filter((badge) => badge.placement === 'footer');
    for (const badge of footerBadges) {
      expect(screen.getByRole('img', { name: badge.alt }).closest('a')).toHaveAttribute(
        'href',
        badge.href
      );
    }
    expect(screen.queryByText('Listed on') !== null).toBe(footerBadges.length > 0);
  });
});

/**
 * The newsletter band leads the footer on every page, as on findergit.app and
 * lancetta.app. An h2, so a page with no h2 of its own (Legal, the FAQ) goes
 * h1, h2 rather than skipping a level, and the subscribe link is the
 * publication itself.
 */
describe('MantineFooter newsletter band', () => {
  it('is an h2 with the Substack publication behind it', () => {
    render(<MantineFooter year={2026} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Get release updates' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Subscribe for updates' })).toHaveAttribute(
      'href',
      config.community.newsletter
    );
    expect(screen.getByRole('link', { name: 'Newsletter' })).toHaveAttribute(
      'href',
      config.community.newsletter
    );
  });
});
