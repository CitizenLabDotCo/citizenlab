import { IResolution } from 'components/admin/ResolutionControl';

// live
export type ResolvedName =
  | 'SurveyQuestionResultWidget'
  | 'MostReactedIdeasWidget'
  | 'SingleIdeaWidget'
  | 'VisitorsWidget'
  | 'VisitorsTrafficSourcesWidget'
  | 'DemographicsWidget'
  | 'GenderWidget'
  | 'AgeWidget'
  | 'ActiveUsersWidget'
  | 'PostsByTimeWidget'
  | 'CommentsByTimeWidget'
  | 'ReactionsByTimeWidget'
  | 'RegistrationsWidget';

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
  | DemographicsParams
  | GenderParams
  | AgeParams
  | ActiveUsersParams
  | PostsByTimeParams
  | CommentsByTimeParams
  | ReactionsByTimeParams
  | RegistrationsParams;

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

interface CompareProps {
  compare_start_at?: string;
  compare_end_at?: string;
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

export interface VisitorsProps
  extends Omit<AnalyticsProps, 'project_id'>,
    CompareProps {}

export interface VisitorsParams extends BaseParams {
  resolved_name: 'VisitorsWidget';
  props: VisitorsProps;
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

export interface BaseDemographicsProps {
  project_id?: string;
  start_at?: string | null | undefined;
  end_at?: string | null;
  group_id?: string | null;
}

export interface DemographicsProps extends BaseDemographicsProps {
  custom_field_id?: string;
}

export interface DemographicsParams extends BaseParams {
  resolved_name: 'DemographicsWidget';
  props: DemographicsProps;
}

export interface GenderParams extends BaseParams {
  resolved_name: 'GenderWidget';
  props: BaseDemographicsProps;
}

export interface AgeParams extends BaseParams {
  resolved_name: 'AgeWidget';
  props: BaseDemographicsProps;
}

export interface ActiveUsersProps extends AnalyticsProps, CompareProps {}

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

export interface RegistrationsProps
  extends Omit<AnalyticsProps, 'project_id'>,
    CompareProps {}

interface RegistrationsParams {
  resolved_name: 'RegistrationsWidget';
  props: RegistrationsProps;
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
