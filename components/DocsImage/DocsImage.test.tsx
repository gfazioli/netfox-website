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

const COLUMN =
  '(max-width: 767.98px) calc(100vw - 32px), (max-width: 1279.98px) calc(100vw - 352px), (max-width: 1439.98px) calc(100vw - 608px), 832px';

function drawn(props: Parameters<typeof DocsImage>[0]) {
  const { container } = render(<DocsImage {...props} />);
  return container.querySelector('img')!;
}

describe('DocsImage', () => {
  it('draws a Retina capture at its size in points, and asks for that width', () => {
    const img = drawn({ src: capture, alt: 'The menu bar panel' });
    expect(img.style.maxWidth).toBe('min(100%, 406px)');
    expect(img.dataset.sizes).toBe('(max-width: 438px) calc(100vw - 32px), 406px');
  });

  it('caps the width it asks for at the column when the capture is wider in points', () => {
    const img = drawn({
      src: { ...capture, src: '/_next/static/media/screenshot-devices.2a1b3c4d.png', width: 2000 },
      alt: 'Devices',
    });
    expect(img.style.maxWidth).toBe('min(100%, 1000px)');
    expect(img.dataset.sizes).toBe(COLUMN);
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

// The column, measured: the viewport less 32px under 768, less 352px under
// 1280, less 608px above, and never wider than 832px.
describe('docsSizes', () => {
  it('follows the column for a picture as wide as it, or wider', () => {
    expect(docsSizes()).toBe(COLUMN);
    expect(docsSizes(1000)).toBe(COLUMN);
  });

  it('gives a picture narrower than the column its own width', () => {
    expect(docsSizes(282)).toBe('(max-width: 314px) calc(100vw - 32px), 282px');
    // The 560x500 widgets: narrower than a phone's column from 592, and
    // wider than the column beside the sidebar up to 912.
    expect(docsSizes(560)).toBe(
      '(max-width: 592px) calc(100vw - 32px), (max-width: 767.98px) 560px, (max-width: 912px) calc(100vw - 352px), 560px'
    );
  });

  it('switches from the column to the picture where they cross on a laptop', () => {
    expect(docsSizes(760)).toBe(
      '(max-width: 767.98px) calc(100vw - 32px), (max-width: 1112px) calc(100vw - 352px), (max-width: 1279.98px) 760px, (max-width: 1368px) calc(100vw - 608px), 760px'
    );
  });
});
