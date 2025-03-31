import { ILinks, IRelationship, Multiloc } from 'typings';

import {
  ActionDescriptor,
  ActionDescriptorFutureEnabled,
  ProjectDisabledReason,
  ProjectCommentingDisabledReason,
  ProjectDocumentAnnotationDisabledReason,
  ProjectPollDisabledReason,
  ProjectPostingDisabledReason,
  ProjectReactingDisabledReason,
  ProjectSurveyDisabledReason,
  ProjectVotingDisabledReason,
  ProjectVolunteeringDisabledReason,
} from 'utils/actionDescriptors/types';
import { Keys } from 'utils/cl-react-query/types';

import {
  IdeaSortMethod,
  InputTerm,
  ParticipationMethod,
  TSurveyService,
} from '../phases/types';

import projectsKeys from './keys';

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
  includeHidden?: boolean;
}

export interface QueryParameters {
  'page[number]': number;
  'page[size]': number;
  sort?: Sort;
  areas?: string[];
  publication_statuses: PublicationStatus[];
  filter_can_moderate?: boolean;
  filter_ids?: string[];
  include_hidden?: boolean;
}

// Responses
export interface IProjects {
  data: IProjectData[];
  links: ILinks;
}

export interface IProject {
  data: IProjectData;
}

export interface IProjectAttributes {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  description_preview_multiloc: Multiloc;
  slug: string;
  preview_token: string;
  created_at: string;
  updated_at: string;
  first_published_at: string | null;
  header_bg: ProjectHeaderBgImageSizes;
  header_bg_alt_text_multiloc: Multiloc;
  comments_count: number;
  avatars_count: number;
  followers_count: number;
  ideas_count: number;
  baskets_count: number;
  votes_count: number;
  visible_to: Visibility;
  timeline_active?: 'past' | 'present' | 'future' | null;
  participants_count: number;
  internal_role: 'open_idea_box' | null;
  publication_status: PublicationStatus;
  include_all_areas: boolean;
  folder_id?: string | null;
  action_descriptors: ActionDescriptors;
  uses_content_builder: boolean;
}

export type ActionDescriptors = {
  posting_idea: ActionDescriptorFutureEnabled<ProjectPostingDisabledReason>;
  commenting_idea: ActionDescriptor<ProjectCommentingDisabledReason>;
  // Same disabled reasons as commenting_idea at time of writing
  comment_reacting_idea: ActionDescriptor<ProjectCommentingDisabledReason>;
  reacting_idea: ActionDescriptor<ProjectReactingDisabledReason> & {
    up: ActionDescriptor<ProjectReactingDisabledReason>;
    down: ActionDescriptor<ProjectReactingDisabledReason>;
  };
  taking_survey: ActionDescriptor<ProjectSurveyDisabledReason>;
  taking_poll: ActionDescriptor<ProjectPollDisabledReason>;
  annotating_document: ActionDescriptor<ProjectDocumentAnnotationDisabledReason>;
  voting: ActionDescriptor<ProjectVotingDisabledReason>;
  attending_event: ActionDescriptor<ProjectDisabledReason>;
  volunteering: ActionDescriptor<ProjectVolunteeringDisabledReason>;
};

export interface IProjectData {
  id: string;
  type: 'project';
  attributes: IProjectAttributes;
  relationships: {
    project_images?: {
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
    permissions?: {
      data: IRelationship[];
    };
  };
}

export type Visibility = 'public' | 'groups' | 'admins';
type PresentationMode = 'map' | 'card';

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
  participation_method?: ParticipationMethod | null;
  submission_enabled?: boolean | null;
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
  ideas_order?: IdeaSortMethod;
  input_term?: InputTerm;
  slug?: string;
  topic_ids?: string[];
  include_all_areas?: boolean;
  folder_id?: string | null;
}
