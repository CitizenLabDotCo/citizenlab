import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';

// live
export type ResolvedName =
  | 'ReactionsByTimeWidget'
  | 'SurveyResultsWidget'
  | 'CommentsByTimeWidget'
  | 'PostsByTimeWidget'
  | 'ActiveUsersWidget'
  | 'VisitorsWidget';

export interface ParametersLive {
  resolvedName: ResolvedName;
  props: PropsLive;
}

interface Dates {
  startAtMoment?: Moment | null | undefined;
  endAtMoment?: Moment | null;
}

interface Resolution {
  resolution?: IResolution;
}

export type PropsLive = Dates &
  Resolution & { projectId?: string | undefined; phaseId?: string | null };

// published
export interface ParametersPublished {
  reportId?: string;
  graphId: string;
}
