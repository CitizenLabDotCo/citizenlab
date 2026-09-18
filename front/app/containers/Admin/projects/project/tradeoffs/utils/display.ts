import { colors } from '@citizenlab/cl2-component-library';

import { ParticipantVotes, Relation, RelationKind, Statement } from '../types';

export const RELATION_COLOR: Readonly<Record<RelationKind, string>> = {
  exclusive: colors.red500,
  additive: colors.green500,
  neutral: colors.grey400,
};

export const RELATION_BACKGROUND: Readonly<Record<RelationKind, string>> = {
  exclusive: colors.red100,
  additive: colors.green100,
  neutral: colors.grey100,
};

export const RELATION_SYMBOL: Readonly<Record<RelationKind, string>> = {
  exclusive: '×',
  additive: '+',
  neutral: '·',
};

export interface StatementLookup {
  readonly byId: ReadonlyMap<string, Statement>;
  /** 1-based display number, in the order of the statement list. */
  readonly numberOf: ReadonlyMap<string, number>;
}

export const buildLookup = (
  statements: readonly Statement[]
): StatementLookup => ({
  byId: new Map(statements.map((statement) => [statement.id, statement])),
  numberOf: new Map(statements.map((statement, i) => [statement.id, i + 1])),
});

export const labelOf = (lookup: StatementLookup, id: string): string =>
  `#${lookup.numberOf.get(id) ?? '?'}`;

export const labelsOf = (
  lookup: StatementLookup,
  ids: readonly string[]
): string => ids.map((id) => labelOf(lookup, id)).join(', ');

export const truncate = (text: string, max: number): string =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

/** Splits a label into at most two lines of roughly equal length. */
export const wrapLabel = (text: string, maxChars: number): string[] => {
  const shortened = truncate(text, maxChars * 2);
  if (shortened.length <= maxChars) return [shortened];
  const words = shortened.split(' ');
  const lines: string[] = [];
  let current = '';
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines.length > 2
    ? [lines[0], truncate(lines.slice(1).join(' '), maxChars)]
    : lines;
};

export const totalParticipantVotes = (votes: ParticipantVotes): number =>
  votes.exclusive + votes.additive + votes.neutral;

export const majorityVote = (votes: ParticipantVotes): RelationKind => {
  if (votes.exclusive >= votes.additive && votes.exclusive >= votes.neutral) {
    return 'exclusive';
  }
  return votes.additive >= votes.neutral ? 'additive' : 'neutral';
};

const MIN_VOTES_FOR_DISAGREEMENT = 10;

/** True when enough participants voted and their majority differs from the recorded kind. */
export const participantsDisagree = (relation: Relation): boolean => {
  const votes = relation.participantVotes;
  if (!votes) return false;
  return (
    totalParticipantVotes(votes) >= MIN_VOTES_FOR_DISAGREEMENT &&
    majorityVote(votes) !== relation.kind
  );
};

export const formatDelta = (delta: number): string =>
  `${delta >= 0 ? '+' : '−'}${Math.round(Math.abs(delta))}`;

export const percent = (fraction: number): number => Math.round(fraction * 100);
