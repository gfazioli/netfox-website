import { render, screen, userEvent, within } from '@/test-utils';
import { ToolTour } from './ToolTour';

const frame = (src: string, eyebrow: string) => ({
  src,
  alt: `${eyebrow} screen`,
  eyebrow,
  title: `${eyebrow} title`,
  body: `${eyebrow} body`,
  href: `/docs/${eyebrow}`,
  linkLabel: `About ${eyebrow}`,
});
const frames = [frame('/a.png', 'Overview'), frame('/b.png', 'Wi-Fi'), frame('/c.png', 'Security')];

describe('ToolTour', () => {
  it('puts each screen beside its copy and link', () => {
    render(<ToolTour frames={frames} />);
    const row = screen.getByRole('region', { name: 'Wi-Fi title' });
    expect(within(row).getByText('Wi-Fi body')).toBeInTheDocument();
    expect(within(row).getByRole('link', { name: 'About Wi-Fi' })).toHaveAttribute(
      'href',
      '/docs/Wi-Fi'
    );
  });

  it('opens the clicked screen full size, and the arrow keys page through', async () => {
    const user = userEvent.setup();
    render(<ToolTour frames={frames} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Enlarge: Wi-Fi' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/b.png');
    expect(within(dialog).getByText('2 / 3')).toBeInTheDocument();

    // From the last screen, forward wraps to the first.
    await user.keyboard('{ArrowRight}');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/c.png');
    await user.keyboard('{ArrowRight}');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/a.png');
    await user.keyboard('{ArrowLeft}');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/c.png');
  });
});
