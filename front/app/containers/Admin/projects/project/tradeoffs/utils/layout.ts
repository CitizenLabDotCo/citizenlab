import { Relation, Statement } from '../types';

export interface Point {
  readonly x: number;
  readonly y: number;
}

interface LayoutOptions {
  readonly width: number;
  readonly height: number;
  readonly radiusOf: (statement: Statement) => number;
  readonly iterations?: number;
}

const REST_LENGTH_ADDITIVE = 180;
const REST_LENGTH_EXCLUSIVE = 380;
const SPRING = 0.06;
const REPULSION = 42000;
const GRAVITY = 0.009;
const LABEL_SPACE = 30;

/**
 * Deterministic force-directed layout. Additive pairs pull together,
 * exclusive pairs push apart, every node repels every other node.
 * The result is stable between renders because the start positions are
 * derived from the statement order, not from randomness.
 */
export const computeForceLayout = (
  statements: readonly Statement[],
  relations: readonly Relation[],
  { width, height, radiusOf, iterations = 400 }: LayoutOptions
): ReadonlyMap<string, Point> => {
  const n = statements.length;
  const cx = width / 2;
  const cy = height / 2;
  const startRadius = Math.min(width, height) * 0.38;

  const index = new Map(statements.map((statement, i) => [statement.id, i]));
  const xs = statements.map(
    (_, i) => cx + startRadius * Math.cos((2 * Math.PI * i) / n - Math.PI / 2)
  );
  const ys = statements.map(
    (_, i) => cy + startRadius * Math.sin((2 * Math.PI * i) / n - Math.PI / 2)
  );
  const radii = statements.map(radiusOf);

  const springs = relations
    .filter((relation) => relation.kind !== 'neutral')
    .flatMap((relation) => {
      const i = index.get(relation.a);
      const j = index.get(relation.b);
      if (i === undefined || j === undefined) return [];
      const rest =
        relation.kind === 'additive'
          ? REST_LENGTH_ADDITIVE
          : REST_LENGTH_EXCLUSIVE;
      return [{ i, j, rest }];
    });

  for (let step = 0; step < iterations; step++) {
    const temperature = 1 - step / iterations;
    const fx = new Array<number>(n).fill(0);
    const fy = new Array<number>(n).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = xs[j] - xs[i];
        const dy = ys[j] - ys[i];
        const distance = Math.max(Math.hypot(dx, dy), 1);
        const minDistance = radii[i] + radii[j] + 24;
        const strength = REPULSION / (distance * distance);
        const overlap = distance < minDistance ? minDistance - distance : 0;
        const force = strength + overlap * 0.5;
        const ux = dx / distance;
        const uy = dy / distance;
        fx[i] -= ux * force;
        fy[i] -= uy * force;
        fx[j] += ux * force;
        fy[j] += uy * force;
      }
    }

    springs.forEach(({ i, j, rest }) => {
      const dx = xs[j] - xs[i];
      const dy = ys[j] - ys[i];
      const distance = Math.max(Math.hypot(dx, dy), 1);
      const force = (distance - rest) * SPRING;
      const ux = dx / distance;
      const uy = dy / distance;
      fx[i] += ux * force;
      fy[i] += uy * force;
      fx[j] -= ux * force;
      fy[j] -= uy * force;
    });

    for (let i = 0; i < n; i++) {
      fx[i] += (cx - xs[i]) * GRAVITY;
      fy[i] += (cy - ys[i]) * GRAVITY;
      const magnitude = Math.hypot(fx[i], fy[i]);
      const maxStep = 40 * temperature + 1;
      const scale = magnitude > maxStep ? maxStep / magnitude : 1;
      xs[i] += fx[i] * scale;
      ys[i] += fy[i] * scale;
      const pad = radii[i] + 8;
      xs[i] = Math.min(width - pad, Math.max(pad, xs[i]));
      // Leave room under the node for its two-line label.
      ys[i] = Math.min(height - pad - LABEL_SPACE, Math.max(pad, ys[i]));
    }
  }

  return new Map(
    statements.map((statement, i) => [statement.id, { x: xs[i], y: ys[i] }])
  );
};
