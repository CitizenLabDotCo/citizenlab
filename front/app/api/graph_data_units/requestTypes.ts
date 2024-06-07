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
  | 'ParticipantsWidget'
  | 'PostsByTimeWidget'
  | 'CommentsByTimeWidget'
  | 'ReactionsByTimeWidget'
  | 'RegistrationsWidget'
  | 'MethodsUsedWidget'
  | 'ParticipationWidget'
  | 'ProjectsWidget';

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
  | ParticipantsParams
  | PostsByTimeParams
  | CommentsByTimeParams
  | ReactionsByTimeParams
  | RegistrationsParams
  | MethodsUsedParams
  | ParticipationParams
  | ProjectsParams;

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

interface DateProps {
  start_at?: string | null | undefined;
  end_at?: string | null;
}

export interface AnalyticsProps extends DateProps {
  project_id?: string | undefined;
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

export interface VisitorsTrafficSourcesProps extends DateProps {
  project_id?: string;
}
export interface VisitorsTrafficSourcesParams extends BaseParams {
  resolved_name: 'VisitorsTrafficSourcesWidget';
  props: VisitorsTrafficSourcesProps;
}

interface BaseDemographicsProps extends DateProps {
  project_id?: string;
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

export interface ParticipantsProps extends AnalyticsProps, CompareProps {}

export interface ParticipantsParams extends BaseParams {
  resolved_name: 'ParticipantsWidget';
  props: ParticipantsProps;
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

export interface MethodsUsedProps extends DateProps, CompareProps {}

interface MethodsUsedParams extends BaseParams {
  resolved_name: 'MethodsUsedWidget';
  props: MethodsUsedProps;
}

export type ParticipationType = 'inputs' | 'comments' | 'votes';

export interface ParticipationProps extends AnalyticsProps, CompareProps {}

interface ParticipationParams extends BaseParams {
  resolved_name: 'ParticipationWidget';
  props: ParticipationProps;
}

export interface ProjectsProps extends DateProps {}

interface ProjectsParams extends BaseParams {
  resolved_name: 'ProjectsWidget';
  props: ProjectsProps;
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
