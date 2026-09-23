import { render, screen, userEvent, within } from '@/test-utils';
import { ScreenshotGallery } from './ScreenshotGallery';

const screens = [
  { src: '/a.png', label: 'Overview', alt: 'Overview screen' },
  { src: '/b.png', label: 'Wi-Fi', alt: 'Wi-Fi screen' },
  { src: '/c.png', label: 'Security', alt: 'Security screen' },
];

describe('ScreenshotGallery', () => {
  it('opens the clicked screen full size, and the arrow keys page through', async () => {
    const user = userEvent.setup();
    render(<ScreenshotGallery screens={screens} ratio="16 / 10" />);

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
