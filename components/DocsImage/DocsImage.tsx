import type { ComponentProps } from 'react';
import { ImageZoom } from '@/components/docs';

export type DocsImageProps = ComponentProps<typeof ImageZoom>;

/**
 * The docs column of the docs engine (`components/shell`: `SiteShell`'s
 * 280px sidebar from Mantine's md, 62em; `DocsPage`'s padding, 1rem on a
 * phone and 2rem from md, its 15rem table of contents and 2rem gap from lg,
 * 75em, the column at most 53.75rem in a 73.75rem page). All of it is rem and
 * em, so it moves with the visitor's default font:
 *
 * - the viewport less 2rem, until that reaches the column's 53.75rem;
 * - 53.75rem, until the sidebar shows at 62em;
 * - the viewport less 21.5rem (the sidebar and the padding), until the table
 *   of contents shows at 75em;
 * - the viewport less 38.5rem (both, the gap and the padding), until the page
 *   reaches its 73.75rem, at 91.25em;
 * - 52.75rem from there.
 *
 * Each stretch ends where the layout switches, with range syntax
 * (`width < 48em`), which excludes the breakpoint itself, so no viewport,
 * however fractional, falls between two. Chrome and Safari read it in `sizes`
 * (measured); a browser that does not skips those clauses and takes the last:
 * more bytes, never a rendering too small. A page with no table of contents,
 * or a collapsed sidebar, draws the column wider than this from 75em: such a
 * picture is fetched a step smaller than its drawn width, never at the
 * wrong ratio.
 */
const STRETCHES: { below?: string; column: string }[] = [
  { below: '55.75em', column: 'calc(100vw - 2rem)' },
  { below: '62em', column: '53.75rem' },
  { below: '75em', column: 'calc(100vw - 21.5rem)' },
  { below: '91.25em', column: 'calc(100vw - 38.5rem)' },
  { column: '52.75rem' },
];

/**
 * `sizes` for a picture drawn at the column's width, or at `width` CSS px when
 * the column is wider: `min()` of the two in each stretch. Chrome and Safari
 * take `min()` in `sizes` (measured); a browser that does not falls back to
 * `100vw`, which fetches more, never a rendering too small.
 */
export function docsSizes(width?: number): string {
  return STRETCHES.map(({ below, column }) => {
    const size = width === undefined ? column : `min(${column}, ${width}px)`;
    return below ? `(width < ${below}) ${size}` : size;
  }).join(', ');
}

/**
 * How wide a capture is in POINTS, which is the size it is drawn at.
 *
 * Every `public/screenshot-*.png` is a Retina capture. The ones under 1664px
 * wide, twice the column (the menu-bar panel, the Notch HUD, the port detail
 * sheets, the 560x500 widgets), are two pixels per point, and a docs page used
 * to draw each one a CSS pixel per file pixel: twice the size of the thing it
 * shows, and upscaled 2x on the Retina screens it was taken for. At 1440 the
 * menu-bar panel (812x944) stood 812 CSS px wide where the Mac draws it at
 * 406, and the port detail sheets (960-984px) filled the whole 832px column.
 * Halved, each is the size it is on the Mac, and sharp.
 *
 * The window shots are captured at 2x and delivered 2000px wide by Netfox's
 * `scripts/screenshots/shoot.sh`, so fewer than two per point (about 1.6 for
 * the 1280-point window); at 1000 they are wider than the column either way,
 * and do not move.
 *
 * Only a static import knows its size, and only the captures follow the 2x
 * rule: anything else (`history-ports.png`, `scanning-in-progress.png`) is
 * drawn as it was.
 */
function pointWidth(src: DocsImageProps['src']): number | undefined {
  if (typeof src !== 'object') {
    return undefined;
  }
  const image = 'default' in src ? src.default : src;
  return image.src.includes('/screenshot-') ? Math.round(image.width / 2) : undefined;
}

/**
 * A docs image: the engine's zoomable image, told how wide it is drawn. Every
 * Markdown image in `content/` comes here (`mdx-components.tsx`), imported by
 * the engine's `remark-static-images` from `public/`.
 *
 * Without `sizes`, next/image offers the srcset as 1x and 2x of the file's own
 * width, and the browser cannot know the column is narrower: the docs' 832px
 * column fetched the 2048px rendering on a laptop and the 3840px one on a
 * Retina laptop, and a phone fetched the 3840px one for a picture drawn 358px
 * wide (measured 2026-09-29, /docs/tools/overview; ported from
 * findergit-website, which measured the same). `docsSizes` follows the column
 * as it was measured, and a capture narrower than the column says its own
 * width.
 */
export function DocsImage(props: DocsImageProps) {
  const points = pointWidth(props.src);

  return (
    <ImageZoom
      sizes={docsSizes(points)}
      {...props}
      style={points ? { maxWidth: `min(100%, ${points}px)`, ...props.style } : props.style}
    />
  );
}
