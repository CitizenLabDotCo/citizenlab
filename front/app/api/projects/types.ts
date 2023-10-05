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
  ParticipationContext,
} from 'utils/participationContexts';
import { Keys } from 'utils/cl-react-query/types';

// Keys
export type ProjectsKeys = Keys<typeof projectsKeys>;

// Misc
type Sort = 'new' | '-new' | 'trending' | '-trending' | 'popular' | '-popular';
export type PublicationStatus = 'draft' | 'published' | 'archived';

interface ProjectHeaderBgImageSizes {
  large: string | null;
}

// useProjects
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

export interface IProject {
  data: IProjectData;
}

export interface IProjectAttributes extends ParticipationContext {
  description_preview_multiloc: Multiloc;
  slug: string;
  header_bg: ProjectHeaderBgImageSizes;
  comments_count: number;
  avatars_count: number;
  followers_count: number;
  visible_to: Visibility;
  process_type: ProcessType;
  timeline_active?: 'past' | 'present' | 'future' | null;
  participants_count: number;
  internal_role: 'open_idea_box' | null;
  publication_status: PublicationStatus;
  include_all_areas: boolean;
  folder_id?: string | null;
  action_descriptor: {
    posting_idea: ActionDescriptorFutureEnabled<PostingDisabledReason>;
    commenting_idea: ActionDescriptor<CommentingDisabledReason>;
    reacting_idea: ActionDescriptor<ProjectReactingDisabledReason> & {
      up: ActionDescriptor<ProjectReactingDisabledReason>;
      down: ActionDescriptor<ProjectReactingDisabledReason>;
    };
    taking_survey: ActionDescriptor<SurveyDisabledReason>;
    taking_poll: ActionDescriptor<PollDisabledReason>;
    annotating_document: ActionDescriptor<DocumentAnnotationDisabledReason>;
  };
  uses_content_builder: boolean;
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
    user_follower: {
      data: IRelationship | null;
    };
  };
}

type Visibility = 'public' | 'groups' | 'admins';
export type ProcessType = 'continuous' | 'timeline';
type PresentationMode = 'map' | 'card';

export type CommentingDisabledReason =
  | 'project_inactive'
  | 'not_supported'
  | 'commenting_disabled'
  | PermissionsDisabledReason;

type ProjectReactingDisabledReason =
  | 'project_inactive'
  | 'not_ideation'
  | 'reacting_disabled'
  | 'disliking_disabled'
  | 'reacting_like_limited_max_reached'
  | 'reacting_dislike_limited_max_reached'
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

export type DocumentAnnotationDisabledReason =
  | 'project_inactive'
  | 'not_document_annotation'
  | PermissionsDisabledReason;

interface ProjectHeaderBgImageSizes {
  large: string | null;
}

// mutations
export interface IUpdatedProjectProperties {
  // header_bg is only a string or null when it's
  // in IUpdatedProjectProperties. The ProjectHeaderBgImageSizes needed
  // to be added because we go from string here to ProjectHeaderBgImageSizes
  // in IProjectAttributes (also in this file) when we save an image
  // selected for upload. ProjectHeaderBgImageSizes needs to be here, because
  // Otherwise TS will complain about this mismatch in
  // front/app/containers/Admin/projects/general/index.tsx
  // This oddity needs to be dealt with
  projectId?: string;
  header_bg?: string | ProjectHeaderBgImageSizes | null;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  description_preview_multiloc?: Multiloc;
  area_ids?: string[];
  visible_to?: Visibility;
  process_type?: ProcessType;
  participation_method?: ParticipationMethod | null;
  posting_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  reacting_enabled?: boolean | null;
  reacting_like_method?: 'limited' | 'unlimited' | null;
  reacting_dislike_method?: 'limited' | 'unlimited' | null;
  reacting_like_limited_max?: number | null;
  reacting_dislike_enabled?: boolean | null;
  reacting_dislike_limited_max?: number | null;
  presentation_mode?: PresentationMode | null;
  admin_publication_attributes?: {
    publication_status?: PublicationStatus;
  };
  publication_status?: PublicationStatus;
  voting_min_total?: number | null;
  voting_max_total?: number | null;
  survey_service?: TSurveyService | null;
  survey_embed_url?: string | null;
  document_annotation_embed_url?: string | null;
  default_assignee_id?: string | null;
  poll_anonymous?: boolean;
  ideas_order?: IdeaDefaultSortMethod;
  input_term?: InputTerm;
  slug?: string;
  topic_ids?: string[];
  include_all_areas?: boolean;
  folder_id?: string | null;
}
