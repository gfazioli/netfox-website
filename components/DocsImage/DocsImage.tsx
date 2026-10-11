import type { ComponentProps } from 'react';
import { ImageZoom } from 'nextra/components';

export type DocsImageProps = ComponentProps<typeof ImageZoom>;

/**
 * The docs column, measured 2026-10-11 on the Nextra 4.6.1 docs layout (on
 * lancetta-website, which runs the same layout; nothing here overrides its
 * widths, and the 1200px hamburger cutoff in theme/global.css moves only the
 * navbar's items): the viewport less 32px on a phone; less 352px once the
 * sidebar shows, at 768; less 608px once the table of contents shows too, at
 * 1280, and never wider than 832px. Between 1185 and 1279 it is wider than
 * 832, which a flat `832px` under-asked for, and at 768 it is 416, not the 768
 * a `(max-width: 768px) 100vw` asked for.
 */
const PHONE_GUTTER = 32;
const SIDEBAR = 352;
const SIDEBAR_AND_TOC = 608;
const COLUMN_MAX = 832;
const SIDEBAR_FROM = 768;
const TOC_FROM = 1280;

/**
 * `sizes` for a picture drawn at the column's width, or at `points` when it is
 * narrower: one clause per stretch of viewport, the column's own formula
 * while the picture fills it and its fixed width once it does not.
 */
export function docsSizes(points = Infinity): string {
  const clauses: [string | null, string][] = [];
  const stretch = (until: number, from: number, gutter: number, top: number) => {
    // The picture fills the column until the column is wider than the picture.
    const full = points + gutter;
    if (points <= from - gutter) {
      clauses.push([`(max-width: ${until - 1}px)`, `${Math.min(points, top)}px`]);
    } else if (full < until && points < top) {
      clauses.push([`(max-width: ${full}px)`, `calc(100vw - ${gutter}px)`]);
      clauses.push([`(max-width: ${until - 1}px)`, `${points}px`]);
    } else {
      clauses.push([`(max-width: ${until - 1}px)`, `calc(100vw - ${gutter}px)`]);
    }
  };
  stretch(SIDEBAR_FROM, 0, PHONE_GUTTER, Infinity);
  stretch(TOC_FROM, SIDEBAR_FROM, SIDEBAR, Infinity);
  stretch(COLUMN_MAX + SIDEBAR_AND_TOC, TOC_FROM, SIDEBAR_AND_TOC, COLUMN_MAX);
  clauses.push([null, `${Math.min(points, COLUMN_MAX)}px`]);

  // A clause that says what the next one says is only a longer way to say it.
  const kept = clauses.filter(
    ([, size], i) => i === clauses.length - 1 || clauses[i + 1][1] !== size
  );
  return kept.map(([media, size]) => (media ? `${media} ${size}` : size)).join(', ');
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
 * A docs image: Nextra's own zoomable image, told how wide it is drawn.
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
