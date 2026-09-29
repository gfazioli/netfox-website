import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ARMS,
  ARMS_TOP,
  BODY,
  BODY_TOP,
  compose,
  HEAD,
  HEIGHT,
  LEGS,
  LEGS_TOP,
  PALETTE,
  PING,
  runs,
  TAIL,
  TAIL_TOP,
  WIDTH,
} from './sprite';

const layers: [readonly string[], number][] = [
  [HEAD, 0],
  [BODY, BODY_TOP],
  [TAIL.up, TAIL_TOP],
  [TAIL.wag, TAIL_TOP],
  [ARMS.stand, ARMS_TOP],
  [ARMS.point, ARMS_TOP],
  [LEGS.stand, LEGS_TOP],
  [LEGS.stepA, LEGS_TOP],
  [LEGS.stepB, LEGS_TOP],
];

/** The cells of `rows` holding one of `letters`, as "x,y". */
function cellsOf(rows: readonly string[], letters: string, top = 0) {
  const found = new Set<string>();
  rows.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (letters.includes(c)) {
        found.add(`${x},${y + top}`);
      }
    })
  );
  return found;
}

describe('the mascot sprite', () => {
  it('is drawn on one grid, 22 by 18, every layer inside it', () => {
    for (const [rows, top] of layers) {
      expect(rows.every((row) => row.length === WIDTH)).toBe(true);
      expect(top + rows.length).toBeLessThanOrEqual(HEIGHT);
    }
    // The legs stand on the last row, under the body.
    expect(LEGS_TOP + LEGS.stand.length).toBe(HEIGHT);
    expect(BODY_TOP + BODY.length).toBe(LEGS_TOP);
  });

  it('uses no colour the palette does not name', () => {
    const used = new Set(
      layers
        .map(([rows]) => rows.join(''))
        .join('')
        .replace(/\./g, '')
    );
    expect([...used].filter((c) => !(c in PALETTE))).toEqual([]);
  });

  it('is painted in the icon’s own colours, the site’s tokens', () => {
    // Hex in the sprite, since an SVG attribute cannot take var(); this is
    // what keeps the two from drifting apart.
    const css = readFileSync(join(__dirname, '../../theme/global.css'), 'utf8');
    const token = (name: string) =>
      css.match(new RegExp(`--nf-${name}:\\s*(#[0-9a-f]{6});`, 'i'))?.[1]?.toLowerCase();
    expect(PALETTE).toEqual({
      K: token('night'),
      F: token('fur'),
      O: token('orange'),
      A: token('amber'),
      C: token('cream'),
    });
  });

  it('pings from the radar dot on its forehead', () => {
    const stand = compose('stand');
    expect(stand[Math.floor(PING.y)][Math.floor(PING.x)]).toBe('A');
    // The dot is the only amber above the eyes.
    expect([...cellsOf(stand.slice(0, 7), 'A')]).toEqual([
      `${Math.floor(PING.x)},${Math.floor(PING.y)}`,
    ]);
  });

  it('points with an arm whose every step shares an edge with the last, clear of the head', () => {
    // A diagonal of single cells touches only at corners and reads as dots.
    // Walk the left arm from the paw along shared edges: it has to reach the
    // shoulder beside the body, and take every cell of the arm with it.
    const left = ARMS.point.map((row) => row.slice(0, 6));
    const arm = cellsOf(left, 'KC', ARMS_TOP);
    const paw = [...cellsOf(left, 'C', ARMS_TOP)];
    const seen = new Set([paw[0]]);
    const queue = [paw[0]];
    while (queue.length) {
      const [x, y] = queue.shift()!.split(',').map(Number);
      for (const next of [`${x + 1},${y}`, `${x - 1},${y}`, `${x},${y + 1}`, `${x},${y - 1}`]) {
        if (arm.has(next) && !seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
    expect(seen).toEqual(arm);
    // The shoulder: the cell right beside the body's outline, on its top row.
    expect(BODY[0][6]).toBe('K');
    expect(seen.has(`5,${BODY_TOP}`)).toBe(true);
    // The paw is up, level with the eyes, and cream so it reads as a paw.
    expect(Math.min(...paw.map((c) => Number(c.split(',')[1])))).toBeLessThan(BODY_TOP - 4);
    // Never touching the head: an arm against the outline merges into it.
    const head = cellsOf(HEAD, 'KFOAC');
    for (const cell of arm) {
      const [x, y] = cell.split(',').map(Number);
      expect(head.has(`${x + 1},${y}`)).toBe(false);
    }
  });

  it('walks by lifting one leg, then the other, as the tail swings', () => {
    const grounded = (legs: readonly string[]) => cellsOf([legs[1]], 'K');
    expect(grounded(LEGS.stand).size).toBe(4);
    expect(grounded(LEGS.stepA).size).toBe(2);
    expect(grounded(LEGS.stepB).size).toBe(2);
    expect([...grounded(LEGS.stepA)].some((c) => grounded(LEGS.stepB).has(c))).toBe(false);
    expect(compose('stepA')).not.toEqual(compose('stepB'));
    expect(TAIL.up).not.toEqual(TAIL.wag);
  });

  it('keeps the tail behind the head and the body', () => {
    // Composed, every cell the head draws is the head's, wherever the tail
    // reaches under it.
    const stand = compose('stand');
    HEAD.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (c !== '.') {
          expect(stand[y][x]).toBe(c);
        }
      })
    );
  });
});

describe('runs', () => {
  it('turns each run of one colour into one rectangle, rows down from `top`', () => {
    expect(runs(['.KKF', 'CC..'], 10)).toEqual([
      { x: 1, y: 10, width: 2, colour: 'K' },
      { x: 3, y: 10, width: 1, colour: 'F' },
      { x: 0, y: 11, width: 2, colour: 'C' },
    ]);
  });
});
