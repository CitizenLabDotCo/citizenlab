import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import opinionGroupsKeys from './keys';

export type OpinionGroupsKeys = Keys<typeof opinionGroupsKeys>;

export interface OpinionGroupsParameters {
  k?: number;
  include_demographics?: boolean;
  demographic_weight?: number;
  min_votes_per_participant?: number;
  min_votes_per_statement?: number;
  privacy_threshold?: number;
}

export type Direction = 'agree' | 'disagree';

export interface KCandidate {
  k: number;
  silhouette: number;
  qualifies: boolean;
}

export interface OpinionGroupsStats {
  participants_total: number;
  participants_included: number;
  statements_total: number;
  statements_included: number;
  votes_total: number;
  votes_included: number;
  group_count: number;
  silhouette: number;
  k_candidates: KCandidate[];
  explained_variance: number[];
}

export interface RepresentativeStatement {
  statement_id: string;
  direction: Direction;
  inside_share: number;
  outside_share: number;
  inside_votes: number;
  z: number;
}

export interface GroupDemographicCategory {
  key: string;
  count: number | null;
  share: number | null;
  overall_share: number | null;
  index: number | null;
  suppressed: boolean;
}

export interface GroupDemographics {
  field_key: string;
  unknown: number;
  categories: GroupDemographicCategory[];
}

export interface OpinionGroup {
  id: number;
  name: string;
  size: number;
  share: number;
  centroid: { x: number; y: number };
  representative: RepresentativeStatement[];
  demographics: GroupDemographics[];
}

export interface VoteCounts {
  up: number;
  down: number;
  neutral: number;
}

export interface Statement {
  id: string;
  title_multiloc: Multiloc;
  votes: VoteCounts;
  group_votes: VoteCounts[];
  group_agree_share: (number | null)[];
}

export interface AxisLoading {
  statement_id: string;
  loading: number;
}

export interface AxisDemographicLoading {
  field_key: string;
  category_key: string;
  loading: number;
}

export interface Axis {
  explained_variance: number;
  positive: AxisLoading[];
  negative: AxisLoading[];
  demographics: AxisDemographicLoading[];
}

export interface ConsensusStatement {
  statement_id: string;
  direction: Direction;
  score: number;
  group_shares: (number | null)[];
}

export interface DivisiveStatement {
  statement_id: string;
  spread: number;
  group_shares: (number | null)[];
}

export interface Point {
  x: number;
  y: number;
  group: number;
  votes: number;
  demographics: Record<string, string | null>;
}

export interface DemographicCategory {
  key: string;
  title_multiloc: Multiloc;
}

export interface DemographicField {
  key: string;
  title_multiloc: Multiloc;
  categories: DemographicCategory[];
}

export interface BalanceCategory {
  key: string;
  voters_count: number | null;
  voters_share: number | null;
  population_share: number | null;
  index: number | null;
  suppressed: boolean;
}

export interface ParticipationBalance {
  field_key: string;
  voters_known: number;
  population_known: number;
  categories: BalanceCategory[];
}

export interface OpinionGroupsAttributes {
  parameters: Required<OpinionGroupsParameters> & { k: number | null };
  stats: OpinionGroupsStats;
  groups: OpinionGroup[];
  statements: Statement[];
  axes: { x: Axis; y: Axis };
  consensus: ConsensusStatement[];
  divisive: DivisiveStatement[];
  points: Point[];
  demographic_fields: DemographicField[];
  participation_balance: ParticipationBalance[];
}

export interface OpinionGroupsData {
  id: string;
  type: 'opinion_groups';
  attributes: OpinionGroupsAttributes;
}

export interface IOpinionGroups {
  data: OpinionGroupsData;
}
