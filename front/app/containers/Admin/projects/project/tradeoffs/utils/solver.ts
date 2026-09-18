import { Relation, Statement, WeightMode } from '../types';

export type WeightFn = (statement: Statement) => number;

/** Share of the smaller weight that an additive pair adds on top of plain support. */
export const SYNERGY_BONUS_RATE = 0.15;

/** Upper bound on maximal feasible sets we enumerate. Keeps the UI responsive. */
const MAX_ENUMERATED_SETS = 5000;

export const weightFor =
  (mode: WeightMode): WeightFn =>
  (statement) => {
    switch (mode) {
      case 'votes':
        return statement.votes;
      case 'likes':
        return statement.likes;
      case 'both':
        return statement.votes + statement.likes;
    }
  };

export const pairKey = (a: string, b: string): string =>
  a < b ? `${a}|${b}` : `${b}|${a}`;

export type RelationIndex = ReadonlyMap<string, Relation>;

export const indexRelations = (relations: readonly Relation[]): RelationIndex =>
  new Map(
    relations.map((relation) => [pairKey(relation.a, relation.b), relation])
  );

export const findRelation = (
  index: RelationIndex,
  a: string,
  b: string
): Relation | undefined => index.get(pairKey(a, b));

export const otherEnd = (relation: Relation, id: string): string =>
  relation.a === id ? relation.b : relation.a;

export interface PackageEvaluation {
  readonly ids: readonly string[];
  readonly feasible: boolean;
  readonly conflicts: readonly Relation[];
  readonly synergies: readonly Relation[];
  /** Sum of the weights of the included statements. */
  readonly support: number;
  readonly synergyBonus: number;
  readonly score: number;
  /** support / total weight of all statements, in 0..1. */
  readonly coverage: number;
}

export const totalWeight = (
  statements: readonly Statement[],
  weightOf: WeightFn
): number =>
  statements.reduce((sum, statement) => sum + weightOf(statement), 0);

export const evaluatePackage = (
  ids: readonly string[],
  statements: readonly Statement[],
  relations: readonly Relation[],
  weightOf: WeightFn
): PackageEvaluation => {
  const idSet = new Set(ids);
  const included = statements.filter((statement) => idSet.has(statement.id));
  const weights = new Map(
    included.map((statement) => [statement.id, weightOf(statement)])
  );

  const conflicts: Relation[] = [];
  const synergies: Relation[] = [];
  relations.forEach((relation) => {
    if (!idSet.has(relation.a) || !idSet.has(relation.b)) return;
    if (relation.kind === 'exclusive') conflicts.push(relation);
    if (relation.kind === 'additive') synergies.push(relation);
  });

  const support = included.reduce(
    (sum, statement) => sum + weightOf(statement),
    0
  );
  const synergyBonus = synergies.reduce((sum, relation) => {
    const wa = weights.get(relation.a) ?? 0;
    const wb = weights.get(relation.b) ?? 0;
    return sum + SYNERGY_BONUS_RATE * Math.min(wa, wb);
  }, 0);
  const total = totalWeight(statements, weightOf);

  return {
    ids: included.map((statement) => statement.id),
    feasible: conflicts.length === 0,
    conflicts,
    synergies,
    support,
    synergyBonus,
    score: support + synergyBonus,
    coverage: total > 0 ? support / total : 0,
  };
};

/**
 * Statements that are not selected but conflict with a selected statement.
 * Maps the blocked id to the selected ids that block it.
 */
export const blockedBy = (
  selectedIds: readonly string[],
  relations: readonly Relation[]
): ReadonlyMap<string, readonly string[]> => {
  const selected = new Set(selectedIds);
  const blocked = new Map<string, string[]>();
  relations.forEach((relation) => {
    if (relation.kind !== 'exclusive') return;
    const aIn = selected.has(relation.a);
    const bIn = selected.has(relation.b);
    if (aIn === bIn) return;
    const blockedId = aIn ? relation.b : relation.a;
    const blockerId = aIn ? relation.a : relation.b;
    const current = blocked.get(blockedId) ?? [];
    blocked.set(blockedId, [...current, blockerId]);
  });
  return blocked;
};

/**
 * All maximal sets of statements without an exclusive pair. These are the
 * maximal cliques of the compatibility graph (Bron-Kerbosch with pivoting).
 */
export const enumerateMaximalFeasibleSets = (
  statements: readonly Statement[],
  relations: readonly Relation[]
): string[][] => {
  const conflictKeys = new Set(
    relations
      .filter((relation) => relation.kind === 'exclusive')
      .map((relation) => pairKey(relation.a, relation.b))
  );
  const compatible = (a: string, b: string) =>
    a !== b && !conflictKeys.has(pairKey(a, b));

  const results: string[][] = [];

  const visit = (r: string[], p: string[], x: string[]) => {
    if (results.length >= MAX_ENUMERATED_SETS) return;
    if (p.length === 0 && x.length === 0) {
      results.push(r);
      return;
    }
    const candidates = [...p, ...x];
    let pivot = candidates[0];
    let bestDegree = -1;
    candidates.forEach((u) => {
      const degree = p.filter((v) => compatible(u, v)).length;
      if (degree > bestDegree) {
        bestDegree = degree;
        pivot = u;
      }
    });

    let remainingP = p;
    let currentX = x;
    p.filter((v) => !compatible(pivot, v)).forEach((v) => {
      visit(
        [...r, v],
        remainingP.filter((w) => compatible(v, w)),
        currentX.filter((w) => compatible(v, w))
      );
      remainingP = remainingP.filter((w) => w !== v);
      currentX = [...currentX, v];
    });
  };

  visit(
    [],
    statements.map((statement) => statement.id),
    []
  );
  return results;
};

const jaccard = (a: readonly string[], b: readonly string[]): number => {
  const setB = new Set(b);
  const intersection = a.filter((id) => setB.has(id)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 1 : intersection / union;
};

interface SuggestOptions {
  readonly count: number;
  /** Two suggestions must differ at least this much (1 - Jaccard). */
  readonly minDistance?: number;
  /** Only suggest packages that contain all of these ids. */
  readonly mustInclude?: readonly string[];
}

/**
 * Best feasible packages by score. The result is diverse: a package that is
 * almost the same as a better one is skipped while enough alternatives exist.
 */
export const suggestPackages = (
  statements: readonly Statement[],
  relations: readonly Relation[],
  weightOf: WeightFn,
  { count, minDistance = 0.25, mustInclude = [] }: SuggestOptions
): PackageEvaluation[] => {
  const required = new Set(mustInclude);
  const ranked = enumerateMaximalFeasibleSets(statements, relations)
    .filter((ids) => mustInclude.every((id) => ids.includes(id)))
    .map((ids) => evaluatePackage(ids, statements, relations, weightOf))
    .sort((a, b) => b.score - a.score);

  const picked: PackageEvaluation[] = [];
  ranked.forEach((candidate) => {
    if (picked.length >= count) return;
    const distinct = picked.every(
      (chosen) => 1 - jaccard(chosen.ids, candidate.ids) >= minDistance
    );
    if (distinct) picked.push(candidate);
  });
  // Fill up with the next best ones when diversity left gaps.
  ranked.forEach((candidate) => {
    if (picked.length >= count) return;
    if (!picked.includes(candidate)) picked.push(candidate);
  });

  return picked.filter((suggestion) =>
    [...required].every((id) => suggestion.ids.includes(id))
  );
};

/** Best feasible package that keeps every currently selected statement. */
export const bestCompletion = (
  selectedIds: readonly string[],
  statements: readonly Statement[],
  relations: readonly Relation[],
  weightOf: WeightFn
): PackageEvaluation | undefined =>
  suggestPackages(statements, relations, weightOf, {
    count: 1,
    mustInclude: selectedIds,
  })[0];

export interface MarginalEffect {
  /** Change in score when the statement is toggled. */
  readonly delta: number;
  /** Selected statements that must leave the package to make room. */
  readonly removed: readonly string[];
  readonly resulting: readonly string[];
}

/**
 * What happens to the current package when a statement is toggled. Adding a
 * statement removes the selected statements it conflicts with.
 */
export const marginalEffect = (
  id: string,
  selectedIds: readonly string[],
  statements: readonly Statement[],
  relations: readonly Relation[],
  weightOf: WeightFn
): MarginalEffect => {
  const current = evaluatePackage(selectedIds, statements, relations, weightOf);
  const isSelected = selectedIds.includes(id);

  if (isSelected) {
    const resulting = selectedIds.filter((selected) => selected !== id);
    const next = evaluatePackage(resulting, statements, relations, weightOf);
    return { delta: next.score - current.score, removed: [], resulting };
  }

  const index = indexRelations(relations);
  const removed = selectedIds.filter(
    (selected) => findRelation(index, selected, id)?.kind === 'exclusive'
  );
  const resulting = [
    ...selectedIds.filter((selected) => !removed.includes(selected)),
    id,
  ];
  const next = evaluatePackage(resulting, statements, relations, weightOf);
  return { delta: next.score - current.score, removed, resulting };
};

/** The n statements with the highest weight, ignoring relations. */
export const topByWeight = (
  statements: readonly Statement[],
  weightOf: WeightFn,
  n: number
): string[] =>
  [...statements]
    .sort((a, b) => weightOf(b) - weightOf(a))
    .slice(0, n)
    .map((statement) => statement.id);
