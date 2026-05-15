import { render, screen } from '@/test-utils';
import { Welcome } from './Welcome';

describe('Welcome component', () => {
  it('renders the hero title', () => {
    render(<Welcome />);
    expect(screen.getByText(/know who's on your network/i)).toBeInTheDocument();
  });
});
