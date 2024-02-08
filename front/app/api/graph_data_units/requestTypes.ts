import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';

// live
export type ResolvedName =
  | 'SurveyResultsWidget'
  | 'SurveyQuestionResultWidget'
  | 'MostReactedIdeasWidget'
  | 'VisitorsWidget'
  | 'VisitorsTrafficSourcesWidget'
  | 'GenderWidget'
  | 'AgeWidget'
  | 'ActiveUsersWidget'
  | 'PostsByTimeWidget'
  | 'CommentsByTimeWidget'
  | 'ReactionsByTimeWidget';

export interface BaseParams {
  resolvedName: ResolvedName;
  props: Record<string, any>;
}

export type ParametersLive =
  | SurveyResultsParams
  | SurveyQuestionResultParams
  | MostReactedIdeasParams
  | VisitorsParams
  | VisitorsTrafficSourcesParams
  | GenderParams
  | AgeParams
  | ActiveUsersParams
  | PostsByTimeParams
  | CommentsByTimeParams
  | ReactionsByTimeParams;

export interface SurveyResultsProps {
  phaseId?: string | null;
}
export interface SurveyResultsParams extends BaseParams {
  resolvedName: 'SurveyResultsWidget';
  props: SurveyResultsProps;
}

export interface SurveyQuestionResultProps {
  phaseId: string;
  questionId: string;
  groupByUserFieldId?: string;
}

export interface SurveyQuestionResultParams extends BaseParams {
  resolvedName: 'SurveyQuestionResultWidget';
  props: SurveyQuestionResultProps;
}

export interface AnalyticsProps {
  projectId?: string | undefined;
  startAtMoment?: Moment | null | undefined;
  endAtMoment?: Moment | null;
  resolution?: IResolution;
}

export interface MostReactedIdeasProps {
  phaseId?: string | null;
  numberOfIdeas?: number;
}
export interface MostReactedIdeasParams extends BaseParams {
  resolvedName: 'MostReactedIdeasWidget';
  props: MostReactedIdeasProps;
}

export interface VisitorsParams extends BaseParams {
  resolvedName: 'VisitorsWidget';
  props: AnalyticsProps;
}

export interface VisitorsTrafficSourcesProps {
  projectId?: string | undefined;
  startAtMoment?: Moment | null | undefined;
  endAtMoment?: Moment | null;
}
export interface VisitorsTrafficSourcesParams extends BaseParams {
  resolvedName: 'VisitorsTrafficSourcesWidget';
  props: VisitorsTrafficSourcesProps;
}

export interface GenderProps {
  projectId?: string | undefined;
  startAtMoment?: Moment | null | undefined;
  endAtMoment?: Moment | null;
  groupId?: string | null;
}
export interface GenderParams extends BaseParams {
  resolvedName: 'GenderWidget';
  props: GenderProps;
}

export interface AgeProps {
  projectId?: string | undefined;
  startAtMoment?: Moment | null | undefined;
  endAtMoment?: Moment | null;
  groupId?: string | null;
}
export interface AgeParams extends BaseParams {
  resolvedName: 'AgeWidget';
  props: AgeProps;
}

export interface ActiveUsersParams extends BaseParams {
  resolvedName: 'ActiveUsersWidget';
  props: AnalyticsProps;
}

export interface PostsByTimeParams extends BaseParams {
  resolvedName: 'PostsByTimeWidget';
  props: AnalyticsProps;
}

export interface CommentsByTimeParams extends BaseParams {
  resolvedName: 'CommentsByTimeWidget';
  props: AnalyticsProps;
}

export interface ReactionsByTimeParams extends BaseParams {
  resolvedName: 'ReactionsByTimeWidget';
  props: AnalyticsProps;
}

// published
export interface ParametersPublished {
  reportId?: string;
  graphId: string;
}

export type Options = {
  enabled?: boolean;
  onSuccess?: () => void;
};
