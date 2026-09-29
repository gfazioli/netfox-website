/**
 * Netfox's mascot: the night fox, drawn from the app icon's own colouring
 * (the user picked it over an orange fox and a fox in profile on 2026-09-29,
 * *"è quello che si avvicina di più al logo"*). Navy fur at the edges of the
 * face and on the ears, the orange running down the middle of the face to the
 * cheeks, cream on the muzzle and the cheek fur, amber eyes, and on the
 * forehead the amber dot of the icon's radar, which pings. Drawn for this
 * site from our own icon, as lancetta.app's and findergit.app's are from
 * theirs: a vendor's character inviting clicks on this app would read as an
 * endorsement it never gave (user, 2026-09-23, on Lancetta).
 *
 * The grids ARE the drawing: `Mascot.tsx` turns each run of one letter into a
 * rectangle, so what is below is what the page draws, cell for cell. 22 cells
 * wide, 18 tall, at 4 px a cell. One letter per colour (`PALETTE`), `.` empty.
 * Every layer is drawn at full width, so a row here is a row of the sprite;
 * `top` says which row it starts on, and the layers are painted in the order
 * of `LAYERS`: the tail behind the body, the body behind the head.
 *
 * Walking, the legs alternate and the tail swings (`LEGS.stepA` with
 * `TAIL.up`, `LEGS.stepB` with `TAIL.wag`); pointing, the left arm climbs up
 * and out from the shoulder, a staircase whose every step shares an EDGE with
 * the last -- a diagonal of single cells touches only at corners, and at this
 * size reads as a row of dots, not as an arm (measured on lancetta.app's) --
 * to a cream paw held up beside the cheek.
 */

/**
 * The icon's colours, the same values as the `--nf-*` tokens in
 * theme/global.css, written out so the drawing is complete on its own: it is
 * read by the tests as well as painted on the page. `sprite.test.ts` holds
 * the two together.
 */
export const PALETTE = {
  /** --nf-night: the outline, the pupils, the nose. */
  K: '#050314',
  /** --nf-fur: the navy fur at the edges of the face, on the body and the tail. */
  F: '#364471',
  /** --nf-orange: the middle of the face, and the inside of the ears. */
  O: '#da5b06',
  /** --nf-amber: the eyes, and the radar dot on the forehead. */
  A: '#fc9f1b',
  /** --nf-cream: the muzzle, the cheek fur, the chest, the tail's tip, the raised paw. */
  C: '#eae2d8',
} as const;

export type Colour = keyof typeof PALETTE;

export const WIDTH = 22;
export const HEIGHT = 18;

/** Rows 0-12: the ears, the face, the eyes and nose, the cheek fur. */
export const HEAD = [
  '....K..........K......',
  '....KK........KK......',
  '....KOK......KOK......',
  '....KOFK....KFOK......',
  '...KFFFFKKKKFFFFK.....',
  '...KFFFFOOOOAFFFK.....',
  '...KFFOOOOOOOOFFK.....',
  '...KFAAOOOOOOAAFK.....',
  '...KFKAOOOOOOAKFK.....',
  '...COOOOOOOOOOOOC.....',
  '...CCOOOCKKCOOOCC.....',
  '....CCCCCCCCCCCC......',
  '.....KKKKKKKKKK.......',
];

/** Rows 13-15: the body, navy with a cream chest. */
export const BODY = [
  // Kept one row a line, like every layer here, by this comment: the
  // formatter would put three short strings on one line and lose the picture.
  '......KFCCCCFK........',
  '......KFCCCCFK........',
  '.......KKKKKK.........',
];
export const BODY_TOP = 13;

/** Rows 6-15: the tail, rising behind the body to a cream tip. */
export const TAIL = {
  up: [
    '..................KK..',
    '.................KCCK.',
    '................KCCCCK',
    '................KFCCCK',
    '...............KFFFCK.',
    '...............KFFFK..',
    '..............KFFFK...',
    '..............KFFK....',
    '..............KFK.....',
    '...............K......',
  ],
  wag: [
    '......................',
    '..................KKK.',
    '.................KCCCK',
    '................KFCCCK',
    '...............KFFFCCK',
    '...............KFFFKK.',
    '..............KFFFK...',
    '..............KFFK....',
    '..............KFK.....',
    '...............K......',
  ],
} as const;
export const TAIL_TOP = 6;

/** Rows 8-14: the arms. Standing, both hang at the body's sides; pointing, the left one is up. */
export const ARMS = {
  stand: [
    '......................',
    '......................',
    '......................',
    '......................',
    '......................',
    '.....K........K.......',
    '.....K........K.......',
  ],
  point: [
    'CC....................',
    'CC....................',
    'KK....................',
    'KK....................',
    '.KK...................',
    '..KKKK........K.......',
    '..............K.......',
  ],
} as const;
export const ARMS_TOP = 8;

/**
 * Rows 16-17: the legs. A leg on the ground is two cells tall, a lifted one
 * is one, off the ground.
 */
export const LEGS = {
  stand: ['.......KK..KK.........', '.......KK..KK.........'],
  stepA: ['.......KK..KK.........', '.......KK.............'],
  stepB: ['.......KK..KK.........', '...........KK.........'],
} as const;
export const LEGS_TOP = 16;

/** The centre of the radar dot on the forehead, in cells: where the ping starts. */
export const PING = { x: 12.5, y: 5.5 } as const;

export interface Cell {
  x: number;
  y: number;
  width: number;
  colour: Colour;
}

/** Each horizontal run of one colour in `rows`, as one rectangle, `top` rows down. */
export function runs(rows: readonly string[], top = 0): Cell[] {
  const cells: Cell[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const colour = row[x];
      if (colour === '.') {
        x += 1;
        continue;
      }
      let width = 1;
      while (row[x + width] === colour) {
        width += 1;
      }
      cells.push({ x, y: y + top, width, colour: colour as Colour });
      x += width;
    }
  });
  return cells;
}

export type Pose = 'stand' | 'stepA' | 'stepB' | 'point';

/**
 * One whole pose as rows, the layers painted in order, for the tests and for
 * reading the drawing as the page shows it. `Mascot.tsx` draws the same layers
 * as rectangles in the same order.
 */
export function compose(pose: Pose): string[] {
  const grid = Array.from({ length: HEIGHT }, () => Array<string>(WIDTH).fill('.'));
  const paint = (rows: readonly string[], top: number) =>
    rows.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (c !== '.') {
          grid[top + y][x] = c;
        }
      })
    );
  paint(pose === 'stepB' ? TAIL.wag : TAIL.up, TAIL_TOP);
  paint(BODY, BODY_TOP);
  paint(HEAD, 0);
  paint(pose === 'point' ? ARMS.point : ARMS.stand, ARMS_TOP);
  paint(LEGS[pose === 'point' ? 'stand' : pose], LEGS_TOP);
  return grid.map((row) => row.join(''));
}
