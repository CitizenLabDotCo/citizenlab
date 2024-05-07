import { IResolution } from 'components/admin/ResolutionControl';

// live
export type ResolvedName =
  | 'SurveyQuestionResultWidget'
  | 'MostReactedIdeasWidget'
  | 'SingleIdeaWidget'
  | 'VisitorsWidget'
  | 'VisitorsTrafficSourcesWidget'
  | 'GenderWidget'
  | 'AgeWidget'
  | 'ActiveUsersWidget'
  | 'PostsByTimeWidget'
  | 'CommentsByTimeWidget'
  | 'ReactionsByTimeWidget';

export interface BaseParams {
  resolved_name: ResolvedName;
  props: Record<string, any>;
}

export type ParametersLive =
  | SurveyQuestionResultParams
  | MostReactedIdeasParams
  | SingleIdeaParams
  | VisitorsParams
  | VisitorsTrafficSourcesParams
  | GenderParams
  | AgeParams
  | ActiveUsersParams
  | PostsByTimeParams
  | CommentsByTimeParams
  | ReactionsByTimeParams;

export type GroupMode = 'user_field' | 'survey_question';

export interface SurveyQuestionResultProps {
  phase_id: string;
  question_id: string;
  group_mode?: GroupMode;
  group_field_id?: string;
}

export interface SurveyQuestionResultParams extends BaseParams {
  resolved_name: 'SurveyQuestionResultWidget';
  props: SurveyQuestionResultProps;
}

export interface AnalyticsProps {
  project_id?: string | undefined;
  start_at?: string | null | undefined;
  end_at?: string | null;
  resolution?: IResolution;
}

export interface MostReactedIdeasProps {
  phase_id?: string | null;
  number_of_ideas?: number;
}
export interface MostReactedIdeasParams extends BaseParams {
  resolved_name: 'MostReactedIdeasWidget';
  props: MostReactedIdeasProps;
}

export interface SingleIdeaProps {
  phase_id?: string | null;
  idea_id?: string;
}
export interface SingleIdeaParams extends BaseParams {
  resolved_name: 'SingleIdeaWidget';
  props: SingleIdeaProps;
}

export interface VisitorsParams extends BaseParams {
  resolved_name: 'VisitorsWidget';
  props: AnalyticsProps;
}

export interface VisitorsTrafficSourcesProps {
  project_id?: string;
  start_at?: string | null | undefined;
  end_at?: string | null;
}
export interface VisitorsTrafficSourcesParams extends BaseParams {
  resolved_name: 'VisitorsTrafficSourcesWidget';
  props: VisitorsTrafficSourcesProps;
}

export interface GenderProps {
  project_id?: string;
  start_at?: string | null | undefined;
  end_at?: string | null;
  group_id?: string | null;
}
export interface GenderParams extends BaseParams {
  resolved_name: 'GenderWidget';
  props: GenderProps;
}

export interface AgeProps {
  project_id?: string;
  start_at?: string | null | undefined;
  end_at?: string | null;
  group_id?: string | null;
}
export interface AgeParams extends BaseParams {
  resolved_name: 'AgeWidget';
  props: AgeProps;
}

export interface ActiveUsersProps extends AnalyticsProps {
  compare_previous_period?: boolean;
}

export interface ActiveUsersParams extends BaseParams {
  resolved_name: 'ActiveUsersWidget';
  props: ActiveUsersProps;
}

export interface PostsByTimeParams extends BaseParams {
  resolved_name: 'PostsByTimeWidget';
  props: AnalyticsProps;
}

export interface CommentsByTimeParams extends BaseParams {
  resolved_name: 'CommentsByTimeWidget';
  props: AnalyticsProps;
}

export interface ReactionsByTimeParams extends BaseParams {
  resolved_name: 'ReactionsByTimeWidget';
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
