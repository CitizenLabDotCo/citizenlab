import { DEMO_RELATIONS, DEMO_STATEMENTS } from '../demoData';
import { Relation, Statement } from '../types';

import {
  bestCompletion,
  blockedBy,
  enumerateMaximalFeasibleSets,
  evaluatePackage,
  marginalEffect,
  suggestPackages,
  topByWeight,
  weightFor,
} from './solver';

const statement = (id: string, votes: number, likes = 0): Statement => ({
  id,
  title: id,
  summary: '',
  theme: 'Test',
  votes,
  likes,
  mergedInputs: 1,
});

const relation = (a: string, b: string, kind: Relation['kind']): Relation => ({
  a,
  b,
  kind,
  confidence: 1,
  source: 'admin',
  confirmed: true,
  rationale: '',
});

const votes = weightFor('votes');

describe('evaluatePackage', () => {
  const statements = [
    statement('a', 100),
    statement('b', 50),
    statement('c', 30),
  ];
  const relations = [
    relation('a', 'b', 'exclusive'),
    relation('a', 'c', 'additive'),
  ];

  it('flags exclusive pairs as conflicts', () => {
    const result = evaluatePackage(['a', 'b'], statements, relations, votes);
    expect(result.feasible).toBe(false);
    expect(result.conflicts).toHaveLength(1);
    expect(result.support).toBe(150);
  });

  it('adds a synergy bonus for additive pairs', () => {
    const result = evaluatePackage(['a', 'c'], statements, relations, votes);
    expect(result.feasible).toBe(true);
    expect(result.synergies).toHaveLength(1);
    expect(result.synergyBonus).toBeCloseTo(0.15 * 30);
    expect(result.coverage).toBeCloseTo(130 / 180);
  });

  it('ignores unknown ids', () => {
    const result = evaluatePackage(['a', 'zzz'], statements, relations, votes);
    expect(result.ids).toEqual(['a']);
  });
});

describe('enumerateMaximalFeasibleSets', () => {
  it('returns the maximal independent sets of the conflict graph', () => {
    const statements = [
      statement('a', 1),
      statement('b', 1),
      statement('c', 1),
    ];
    const relations = [relation('a', 'b', 'exclusive')];
    const sets = enumerateMaximalFeasibleSets(statements, relations).map(
      (ids) => [...ids].sort().join('')
    );
    expect(sets.sort()).toEqual(['ac', 'bc']);
  });

  it('returns one set with every statement when nothing conflicts', () => {
    const statements = [statement('a', 1), statement('b', 1)];
    const sets = enumerateMaximalFeasibleSets(statements, []);
    expect(sets).toHaveLength(1);
    expect(sets[0]).toHaveLength(2);
  });
});

describe('suggestPackages on the demo data', () => {
  it('never suggests a package with a conflict', () => {
    const suggestions = suggestPackages(
      DEMO_STATEMENTS,
      DEMO_RELATIONS,
      votes,
      {
        count: 3,
      }
    );
    expect(suggestions).toHaveLength(3);
    suggestions.forEach((suggestion) => expect(suggestion.feasible).toBe(true));
  });

  it('ranks by score and keeps suggestions distinct', () => {
    const [first, second] = suggestPackages(
      DEMO_STATEMENTS,
      DEMO_RELATIONS,
      votes,
      { count: 2 }
    );
    expect(first.score).toBeGreaterThanOrEqual(second.score);
    expect(first.ids).not.toEqual(second.ids);
  });

  it('beats the naive top-by-weight selection, which has conflicts', () => {
    const naive = evaluatePackage(
      topByWeight(DEMO_STATEMENTS, votes, 6),
      DEMO_STATEMENTS,
      DEMO_RELATIONS,
      votes
    );
    expect(naive.feasible).toBe(false);
  });
});

describe('bestCompletion', () => {
  it('keeps the selected statements', () => {
    const completion = bestCompletion(
      ['s2'],
      DEMO_STATEMENTS,
      DEMO_RELATIONS,
      votes
    );
    expect(completion?.ids).toContain('s2');
    expect(completion?.ids).not.toContain('s1');
    expect(completion?.feasible).toBe(true);
  });

  it('returns nothing when the selection is infeasible', () => {
    const completion = bestCompletion(
      ['s1', 's2'],
      DEMO_STATEMENTS,
      DEMO_RELATIONS,
      votes
    );
    expect(completion).toBeUndefined();
  });
});

describe('marginalEffect and blockedBy', () => {
  it('removes conflicting selections when adding a statement', () => {
    const effect = marginalEffect(
      's2',
      ['s1', 's4'],
      DEMO_STATEMENTS,
      DEMO_RELATIONS,
      votes
    );
    expect(effect.removed).toEqual(['s1']);
    expect(effect.resulting).toEqual(['s4', 's2']);
    expect(effect.delta).toBeLessThan(0);
  });

  it('lists blocked statements with their blockers', () => {
    const blocked = blockedBy(['s1'], DEMO_RELATIONS);
    expect(blocked.get('s2')).toEqual(['s1']);
    expect(blocked.has('s4')).toBe(false);
  });
});
