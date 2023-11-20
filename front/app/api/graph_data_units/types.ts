import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

// live
export type ResolvedName = 'ReactionsByTimeWidget';

export interface ParametersLive {
  resolvedName: ResolvedName;
  props: PropsLive;
}

export type PropsLive = ProjectId & Dates & Resolution;

// published
export interface ParametersPublished {
  reportId: string;
  graphId: string;
}
