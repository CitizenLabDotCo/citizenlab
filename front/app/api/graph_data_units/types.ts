import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';

// live
export type ResolvedName =
  | 'SurveyResultsWidget'
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
  | MostReactedIdeasParams
  | VisitorsParams
  | VisitorsTrafficSourcesParams
  | GenderParams
  | AgeParams
  | ActiveUsersParams
  | PostsByTimeParams
  | CommentsByTimeParams
  | ReactionsByTimeParams;

export interface SurveyResultsParams extends BaseParams {
  resolvedName: 'SurveyResultsWidget';
  props: {
    phaseId?: string | null;
  };
}

interface AnalyticsProps {
  projectId?: string | undefined;
  startAtMoment?: Moment | null | undefined;
  endAtMoment?: Moment | null;
  resolution?: IResolution;
}

export interface MostReactedIdeasParams extends BaseParams {
  resolvedName: 'MostReactedIdeasWidget';
  props: {
    projectId?: string | undefined;
    phaseId?: string | null;
    numberOfIdeas?: number;
  };
}

export interface VisitorsParams extends BaseParams {
  resolvedName: 'VisitorsWidget';
  props: AnalyticsProps;
}

export interface VisitorsTrafficSourcesParams extends BaseParams {
  resolvedName: 'VisitorsTrafficSourcesWidget';
  props: {
    projectId?: string | undefined;
    startAtMoment?: Moment | null | undefined;
    endAtMoment?: Moment | null;
  };
}

export interface GenderParams extends BaseParams {
  resolvedName: 'GenderWidget';
  props: {
    projectId?: string | undefined;
    startAtMoment?: Moment | null | undefined;
    endAtMoment?: Moment | null;
    groupId?: string | null;
  };
}

export interface AgeParams extends BaseParams {
  resolvedName: 'AgeWidget';
  props: {
    projectId?: string | undefined;
    startAtMoment?: Moment | null | undefined;
    endAtMoment?: Moment | null;
    groupId?: string | null;
  };
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
