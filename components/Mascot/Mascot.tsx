import {
  ARMS,
  ARMS_TOP,
  BODY,
  BODY_TOP,
  HEAD,
  HEIGHT,
  LEGS,
  LEGS_TOP,
  PALETTE,
  runs,
  TAIL,
  TAIL_TOP,
  WIDTH,
} from './sprite';
import classes from './Mascot.module.css';

/** Pixels per cell. Whole pixels, so `crispEdges` lands every edge on the grid. */
export const SCALE = 4;

// The drawing never changes, so it is turned into rectangles once.
const tail = { up: runs(TAIL.up, TAIL_TOP), wag: runs(TAIL.wag, TAIL_TOP) };
const body = runs(BODY, BODY_TOP);
const head = runs(HEAD);
const arms = { stand: runs(ARMS.stand, ARMS_TOP), point: runs(ARMS.point, ARMS_TOP) };
const legs = {
  stand: runs(LEGS.stand, LEGS_TOP),
  stepA: runs(LEGS.stepA, LEGS_TOP),
  stepB: runs(LEGS.stepB, LEGS_TOP),
};

function Cells({ cells }: { cells: ReturnType<typeof runs> }) {
  return (
    <>
      {cells.map(({ x, y, width, colour }) => (
        <rect key={`${x},${y}`} x={x} y={y} width={width} height={1} fill={PALETTE[colour]} />
      ))}
    </>
  );
}

/**
 * The sprite (see `sprite.ts` for the drawing and why it is ours), painted in
 * the order of its layers: tail, body, head, arms, legs. Walking, both frames
 * of the tail and of the legs are drawn and the stylesheet shows one pair at a
 * time; pointing, the left arm is up.
 */
export function Mascot({ walking = false, pointing = false }) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH * SCALE}
      height={HEIGHT * SCALE}
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
      className={classes.sprite}
    >
      {walking ? (
        <>
          <g className={classes.stepA}>
            <Cells cells={tail.up} />
          </g>
          <g className={classes.stepB}>
            <Cells cells={tail.wag} />
          </g>
        </>
      ) : (
        <Cells cells={tail.up} />
      )}
      <Cells cells={body} />
      <Cells cells={head} />
      <Cells cells={pointing ? arms.point : arms.stand} />
      {walking ? (
        <>
          <g className={classes.stepA}>
            <Cells cells={legs.stepA} />
          </g>
          <g className={classes.stepB}>
            <Cells cells={legs.stepB} />
          </g>
        </>
      ) : (
        <Cells cells={legs.stand} />
      )}
    </svg>
  );
}
