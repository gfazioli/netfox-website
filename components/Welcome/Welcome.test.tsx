import { render, screen } from '@/test-utils';
import { Welcome } from './Welcome';

describe('Welcome component', () => {
  it('renders the hero title', () => {
    render(<Welcome />);
    expect(screen.getByText(/^your network,/i)).toBeInTheDocument();
  });
});
