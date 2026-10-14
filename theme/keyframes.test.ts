import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/*
 * Every animation the site's own stylesheets declare moves only what Chrome
 * runs on the compositor. Anything else -- a box-shadow, a filter that moves
 * pixels, a custom property, a width -- ticks on the main thread once a frame,
 * and an infinite one does it for as long as the page is open: the release
 * cadence dot's box-shadow pulse cost 0.3-0.7 s of main thread per 10 s at
 * rest (2026-09-29, ReleaseCadence.module.css), and findergit.app's footer
 * NEW badge, the same component as here, 0.6-0.8 s (2026-10-14, CPU 4x).
 * Mantine's generated `theme/mantine.css` is not ours and is left out.
 */
const ROOT = join(__dirname, '..');
const COMPOSITED = ['opacity', 'transform', 'translate', 'scale', 'rotate'];

function stylesheets(): string[] {
  return ['app', 'components', 'theme']
    .flatMap((dir) =>
      readdirSync(join(ROOT, dir), { recursive: true, encoding: 'utf8' }).map((file) =>
        join(ROOT, dir, file)
      )
    )
    .filter((file) => file.endsWith('.css') && !file.endsWith(join('theme', 'mantine.css')));
}

/** Each `@keyframes` block in a stylesheet: its name and the text between its braces. */
function keyframes(css: string) {
  return [...css.matchAll(/@keyframes ([\w-]+)\s*\{/g)].map((match) => {
    const open = match.index + match[0].length - 1;
    let depth = 0;
    for (let i = open; i < css.length; i += 1) {
      if (css[i] === '{') {
        depth += 1;
      } else if (css[i] === '}') {
        depth -= 1;
        if (depth === 0) {
          return { name: match[1], body: css.slice(open + 1, i) };
        }
      }
    }
    throw new Error(`unclosed @keyframes ${match[1]}`);
  });
}

const sheets = stylesheets().map((file) => ({
  where: relative(ROOT, file),
  css: readFileSync(file, 'utf8'),
}));

const blocks = sheets.flatMap(({ where, css }) =>
  keyframes(css).map((block) => ({ ...block, where: `${where} @keyframes ${block.name}` }))
);

/*
 * Every transition a reveal starts (`[data-revealed]`, set by
 * components/Motion/useReveal as a scope scrolls into view): each item a
 * scroll brings in runs it, so it is held to the compositor too. Only these:
 * a hover's single short transition (a border colour, a shadow) is not paid
 * by the scroll. Motion.module.css is not the only stylesheet with one, which
 * is why this walks them all: SolutionSection's "after" came in through a
 * `filter` transition until 2026-10-14.
 */
const revealTransitions = sheets.flatMap(({ where, css }) =>
  [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{};]+)\{([^{}]*)\}/g)]
    .filter((rule) => rule[1].includes('[data-revealed]'))
    .flatMap((rule) =>
      [...rule[2].matchAll(/transition(?:-property)?\s*:([^;]+)/g)].map((declaration) => {
        // The commas inside cubic-bezier() and calc() are not between transitions.
        let flat = declaration[1];
        while (/\([^()]*\)/.test(flat)) {
          flat = flat.replace(/\([^()]*\)/g, '');
        }
        return [
          `${where} ${rule[1].trim().replace(/\s+/g, ' ')}`,
          flat.split(',').map((one) => one.trim().split(/\s+/)[0]),
        ] as const;
      })
    )
);

describe('the site’s own animations', () => {
  it('finds the stylesheets it guards', () => {
    expect(blocks.length).toBeGreaterThan(20);
  });

  it.each(blocks.map((block) => [block.where, block.body]))(
    '%s moves only what the compositor runs',
    (_where, body) => {
      // A keyframe's own timing function is a descriptor, not a property it moves.
      const properties = [...body.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([\w-]+)\s*:/g)]
        .map((match) => match[1])
        .filter((p) => p !== 'animation-timing-function');
      expect(properties.length).toBeGreaterThan(0);
      expect(properties.filter((p) => !COMPOSITED.includes(p))).toEqual([]);
    }
  );

  it('finds the transitions a reveal starts', () => {
    expect(revealTransitions.length).toBeGreaterThan(3);
  });

  it.each(revealTransitions)(
    '%s transitions only what the compositor runs',
    (_where, properties) => {
      expect(properties.length).toBeGreaterThan(0);
      expect(properties.filter((p) => !COMPOSITED.includes(p))).toEqual([]);
    }
  );
});
