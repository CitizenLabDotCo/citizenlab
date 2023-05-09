import projectsKeys from './keys';

// typings
import {
  PermissionsDisabledReason,
  ActionDescriptor,
  ActionDescriptorFutureEnabled,
} from 'utils/actionDescriptors';
import { ILinks, IRelationship, Multiloc } from 'typings';
import {
  TSurveyService,
  ParticipationMethod,
  IdeaDefaultSortMethod,
  InputTerm,
} from 'services/participationContexts';
import { Keys } from 'utils/cl-react-query/types';

// Keys
export type ProjectsKeys = Keys<typeof projectsKeys>;

// Query params
type Sort = 'new' | '-new' | 'trending' | '-trending' | 'popular' | '-popular';
export type PublicationStatus = 'draft' | 'published' | 'archived';

export interface Props {
  pageNumber?: number;
  pageSize?: number;
  sort?: Sort;
  areas?: string[];
  publicationStatuses: PublicationStatus[];
  canModerate?: boolean;
  projectIds?: string[];
}

export interface QueryParameters {
  'page[number]': number;
  'page[size]': number;
  sort?: Sort;
  areas?: string[];
  publication_statuses: PublicationStatus[];
  filter_can_moderate?: boolean;
  filter_ids?: string[];
}

// Responses
export interface IProjects {
  data: IProjectData[];
  links: ILinks;
}

export interface IProjectAttributes {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  description_preview_multiloc: Multiloc;
  slug: string;
  header_bg: ProjectHeaderBgImageSizes;
  ideas_count: number;
  comments_count: number;
  avatars_count: number;
  created_at: string;
  updated_at: string;
  visible_to: Visibility;
  process_type: ProcessType;
  timeline_active?: 'past' | 'present' | 'future' | null;
  participants_count: number;
  participation_method: ParticipationMethod;
  posting_enabled: boolean;
  commenting_enabled: boolean;
  // voting_enabled should be used to update the project setting
  // and as a read value if we don't know if the user is doing an up/down vote
  // (although the action_descriptor might be better for that too, to be checked).
  //
  // voting_enabled doesn't take downvoting_enabled into account
  // or upvoting_limited_max/downvoting_limited_max.
  // For more specific values, see the voting_idea action_descriptor
  voting_enabled: boolean;
  upvoting_method: 'limited' | 'unlimited';
  upvoting_limited_max: number;
  downvoting_enabled: boolean;
  downvoting_method: 'limited' | 'unlimited';
  downvoting_limited_max: number;
  presentation_mode: PresentationMode;
  internal_role: 'open_idea_box' | null;
  publication_status: PublicationStatus;
  min_budget?: number | null;
  max_budget?: number | null;
  survey_service?: TSurveyService | null;
  survey_embed_url?: string | null;
  // MISMATCH: ordering doesn't seem to exist on real response
  // ordering: number;
  poll_anonymous?: boolean;
  ideas_order?: IdeaDefaultSortMethod;
  input_term: InputTerm;
  include_all_areas: boolean;
  folder_id?: string | null;
  action_descriptor: {
    posting_idea: ActionDescriptorFutureEnabled<PostingDisabledReason>;
    commenting_idea: ActionDescriptor<CommentingDisabledReason>;
    voting_idea: ActionDescriptor<ProjectVotingDisabledReason> & {
      up: ActionDescriptor<ProjectVotingDisabledReason>;
      down: ActionDescriptor<ProjectVotingDisabledReason>;
    };
    taking_survey: ActionDescriptor<SurveyDisabledReason>;
    taking_poll: ActionDescriptor<PollDisabledReason>;
  };
}

export interface IProjectData {
  id: string;
  type: 'project';
  attributes: IProjectAttributes;
  relationships: {
    project_images: {
      data: IRelationship[];
    };
    areas: {
      data: IRelationship[];
    };
    avatars?: {
      data?: IRelationship[];
    };
    topics: {
      data: IRelationship[];
    };
    current_phase?: {
      data: IRelationship | null;
    };
    user_basket?: {
      data: IRelationship | null;
    };
    default_assignee?: {
      data: IRelationship | null;
    };
    admin_publication: {
      data: IRelationship | null;
    };
  };
}

type Visibility = 'public' | 'groups' | 'admins';
export type ProcessType = 'continuous' | 'timeline';
type PresentationMode = 'map' | 'card';

// keys in project.attributes.action_descriptor
export type IProjectAction =
  | 'commenting_idea'
  | 'voting_idea'
  | 'posting_idea'
  | 'taking_survey'
  | 'taking_poll';

export type CommentingDisabledReason =
  | 'project_inactive'
  | 'not_supported'
  | 'commenting_disabled'
  | PermissionsDisabledReason;

export type ProjectVotingDisabledReason =
  | 'project_inactive'
  | 'not_ideation'
  | 'voting_disabled'
  | 'downvoting_disabled'
  | 'upvoting_limited_max_reached'
  | 'downvoting_limited_max_reached'
  | PermissionsDisabledReason;

export type PostingDisabledReason =
  | 'project_inactive'
  | 'not_ideation'
  | 'posting_disabled'
  | 'posting_limited_max_reached'
  | PermissionsDisabledReason;

export type SurveyDisabledReason =
  | 'project_inactive'
  | 'not_survey'
  | PermissionsDisabledReason;

export type PollDisabledReason =
  | 'project_inactive'
  | 'not_poll'
  | 'already_responded'
  | PermissionsDisabledReason;

interface ProjectHeaderBgImageSizes {
  large: string | null;
}
