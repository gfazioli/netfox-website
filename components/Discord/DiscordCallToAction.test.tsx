import { render, screen } from '@/test-utils';
import config from '@/config';
import { DiscordCallToAction } from './DiscordCallToAction';

describe('DiscordCallToAction', () => {
  it('names the server in a heading and links to the invite in a new tab', () => {
    render(<DiscordCallToAction />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Join the community on Discord'
    );
    const link = screen.getByRole('link', { name: /join the discord/i });
    expect(link).toHaveAttribute('href', config.community.discord);
    expect(link).toHaveAttribute('target', '_blank');
  });
});
