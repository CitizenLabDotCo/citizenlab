import { IResolution } from 'components/admin/ResolutionControl';

// live
export type ResolvedName =
  | 'SurveyQuestionResultWidget'
  | 'MostReactedIdeasWidget'
  | 'SingleIdeaWidget'
  | 'VisitorsWidget'
  | 'VisitorsTrafficSourcesWidget'
  | 'VisitorsLanguagesWidget'
  | 'DemographicsWidget'
  | 'GenderWidget'
  | 'AgeWidget'
  | 'ParticipantsWidget'
  | 'ReactionsByTimeWidget'
  | 'RegistrationsWidget'
  | 'MethodsUsedWidget'
  | 'ParticipationWidget'
  | 'ProjectsWidget'
  | 'DeviceTypesWidget';

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
  | VisitorsLanguagesParams
  | DemographicsParams
  | ParticipantsParams
  | ReactionsByTimeParams
  | RegistrationsParams
  | MethodsUsedParams
  | ParticipationParams
  | ProjectsParams
  | DeviceTypesParams;

export type GroupMode = 'user_field' | 'survey_question';
type ExcludeRoles = 'exclude_admins_and_moderators';

export interface SurveyQuestionResultProps {
  phase_id: string;
  question_id: string;
  group_mode?: GroupMode;
  group_field_id?: string;
  year?: string;
  quarter?: string;
}

export interface SurveyQuestionResultParams extends BaseParams {
  resolved_name: 'SurveyQuestionResultWidget';
  props: SurveyQuestionResultProps;
}

interface DateProps {
  start_at?: string | null | undefined;
  end_at?: string | null;
}

interface ProjectId {
  project_id?: string | null;
}

export interface AnalyticsProps extends DateProps, ProjectId {
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

export interface VisitorsProps extends AnalyticsProps, CompareProps {}

export interface VisitorsParams extends BaseParams {
  resolved_name: 'VisitorsWidget';
  props: VisitorsProps;
}

export interface VisitorsTrafficSourcesProps extends DateProps, ProjectId {
  exclude_roles?: ExcludeRoles;
}
export interface VisitorsTrafficSourcesParams extends BaseParams {
  resolved_name: 'VisitorsTrafficSourcesWidget';
  props: VisitorsTrafficSourcesProps;
}

export interface VisitorsLanguagesProps extends DateProps {
  project_id?: string;
  exclude_roles?: ExcludeRoles;
}
export interface VisitorsLanguagesParams extends BaseParams {
  resolved_name: 'VisitorsLanguagesWidget';
  props: VisitorsLanguagesProps;
}

interface BaseDemographicsProps extends DateProps, ProjectId {
  group_id?: string | null;
}

export interface DemographicsProps extends BaseDemographicsProps {
  custom_field_id?: string;
}

export interface DemographicsParams extends BaseParams {
  resolved_name: 'DemographicsWidget';
  props: DemographicsProps;
}

export interface ParticipantsProps extends AnalyticsProps, CompareProps {
  exclude_roles?: ExcludeRoles;
}

export interface ParticipantsParams extends BaseParams {
  resolved_name: 'ParticipantsWidget';
  props: ParticipantsProps;
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

export type ProjectReportsPublicationStatus = 'published' | 'archived';

export interface ProjectsProps extends DateProps {
  publication_statuses?: ProjectReportsPublicationStatus[];
}

interface ProjectsParams extends BaseParams {
  resolved_name: 'ProjectsWidget';
  props: ProjectsProps;
}

export interface DeviceTypesProps extends DateProps, ProjectId {
  exclude_roles?: ExcludeRoles;
}

export interface DeviceTypesParams extends BaseParams {
  resolved_name: 'DeviceTypesWidget';
  props: DeviceTypesProps;
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
