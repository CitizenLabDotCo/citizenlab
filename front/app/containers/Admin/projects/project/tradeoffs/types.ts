// Prototype types for the WP7 trade-off map.
// A "statement" is a cleaned-up position statement. In this prototype it
// stands in for an idea that was merged and rewritten by the sensemaking
// pipeline. A "relation" describes how two statements interact when both
// end up in the same decision.

export type RelationKind = 'exclusive' | 'additive' | 'neutral';

export type RelationSource = 'ai' | 'admin' | 'participants';

export type WeightMode = 'votes' | 'likes' | 'both';

export interface Statement {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly theme: string;
  readonly votes: number;
  readonly likes: number;
  /** Number of raw inputs that were merged into this cleaned-up statement. */
  readonly mergedInputs: number;
}

export interface ParticipantVotes {
  readonly exclusive: number;
  readonly additive: number;
  readonly neutral: number;
}

export interface Relation {
  /** Statement ids. Always stored with a < b. */
  readonly a: string;
  readonly b: string;
  readonly kind: RelationKind;
  /** 0..1. For AI suggestions this is the model confidence. */
  readonly confidence: number;
  readonly source: RelationSource;
  /** True when a moderator reviewed the relation. */
  readonly confirmed: boolean;
  readonly rationale: string;
  readonly participantVotes?: ParticipantVotes;
}

export type Pair = readonly [string, string];
