import type { CSSProperties } from 'react';
import { render } from '@/test-utils';
import { DocsImage, docsSizes } from './DocsImage';

// Nextra ships ESM that Jest does not transform. What is under test is what
// DocsImage hands to ImageZoom, so a stand-in records exactly that.
jest.mock(
  'nextra/components',
  () => ({
    ImageZoom: (props: { alt?: string; sizes?: string; style?: CSSProperties }) => (
      <img alt={props.alt} data-sizes={props.sizes} style={props.style} />
    ),
  }),
  { virtual: true }
);

// A static import, the shape Nextra makes of a Markdown image in `public/`:
// the menu-bar panel, a 2x capture of a 406-point panel.
const capture = {
  src: '/_next/static/media/screenshot-menu-bar.1z71mrr.png',
  width: 812,
  height: 944,
};

/** What a picture of unknown width asks for: the whole column. */
const COLUMN = docsSizes();

function drawn(props: Parameters<typeof DocsImage>[0]) {
  const { container } = render(<DocsImage {...props} />);
  return container.querySelector('img')!;
}

describe('DocsImage', () => {
  it('draws a Retina capture at its size in points, and asks for that width', () => {
    const img = drawn({ src: capture, alt: 'The menu bar panel' });
    expect(img.style.maxWidth).toBe('min(100%, 406px)');
    expect(img.dataset.sizes).toBe(docsSizes(406));
  });

  it('asks for the smaller of the column and the capture in points', () => {
    const img = drawn({
      src: { ...capture, src: '/_next/static/media/screenshot-devices.2a1b3c4d.png', width: 2000 },
      alt: 'Devices',
    });
    expect(img.style.maxWidth).toBe('min(100%, 1000px)');
    expect(img.dataset.sizes).toBe(docsSizes(1000));
  });

  it('reads a capture imported as a module the same way', () => {
    const img = drawn({ src: { default: capture }, alt: 'The menu bar panel' });
    expect(img.style.maxWidth).toBe('min(100%, 406px)');
  });

  it('leaves anything that is not a capture as it was', () => {
    const picture = drawn({
      src: { src: '/_next/static/media/history-ports.5e6f7a8b.png', width: 3072, height: 1886 },
      alt: '',
    });
    expect(picture.style.maxWidth).toBe('');
    expect(picture.dataset.sizes).toBe(COLUMN);

    const remote = drawn({ src: 'https://example.com/screenshot-x.png', alt: '' });
    expect(remote.style.maxWidth).toBe('');
  });

  it('keeps a style passed in, over its own', () => {
    const img = drawn({ src: capture, alt: '', style: { maxWidth: '100%' } });
    expect(img.style.maxWidth).toBe('100%');
  });
});

// The column, measured: in rem and em, as Nextra lays it out, so that it
// moves with the visitor's default font.
describe('docsSizes', () => {
  it('follows the column for a picture of unknown width', () => {
    expect(docsSizes()).toBe(
      '(max-width: 47.99875em) calc(100vw - 2rem), (max-width: 79.99875em) calc(100vw - 22rem), (max-width: 89.99875em) calc(100vw - 38rem), 52rem'
    );
  });

  it('asks for the smaller of the column and the picture, in each stretch', () => {
    expect(docsSizes(380)).toBe(
      '(max-width: 47.99875em) min(calc(100vw - 2rem), 380px), (max-width: 79.99875em) min(calc(100vw - 22rem), 380px), (max-width: 89.99875em) min(calc(100vw - 38rem), 380px), min(52rem, 380px)'
    );
  });
});
