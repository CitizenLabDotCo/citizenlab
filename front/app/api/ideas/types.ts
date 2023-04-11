import { ILinks, Multiloc, IRelationship } from 'typings';
import {
  CommentingDisabledReason,
  PublicationStatus as ProjectPublicationStatus,
} from 'services/projects';
import { Keys } from 'utils/cl-react-query/types';
import ideasKeys from './keys';

export type IdeasKeys = Keys<typeof ideasKeys>;

export type IdeaPublicationStatus = 'draft' | 'published' | 'archived' | 'spam';

// keys in ideas.attributes.action_descriptor
export type IIdeaAction =
  | 'voting_idea'
  | 'commenting_idea'
  | 'comment_voting_idea'
  | 'budgeting';

// export type IIdeaAction = keyof IIdeaData['attributes']['action_descriptor'];

export type IdeaVotingDisabledReason =
  | 'project_inactive'
  | 'not_ideation'
  | 'voting_disabled'
  | 'downvoting_disabled'
  | 'not_signed_in'
  | 'upvoting_limited_max_reached'
  | 'downvoting_limited_max_reached'
  | 'idea_not_in_current_phase'
  | 'not_permitted'
  | 'not_verified';

export type IdeaCommentingDisabledReason =
  | 'idea_not_in_current_phase'
  | CommentingDisabledReason;

export type IdeaBudgetingDisabledReason =
  | 'project_inactive'
  | 'idea_not_in_current_phase'
  | 'not_permitted'
  | 'not_verified'
  | 'not_signed_in'
  | 'not_budgeting'
  | null
  | undefined;

export type Sort =
  | 'random'
  | 'new'
  | '-new'
  | 'trending'
  | '-trending'
  | 'popular'
  | '-popular'
  | 'author_name'
  | '-author_name'
  | 'upvotes_count'
  | '-upvotes_count'
  | 'downvotes_count'
  | '-downvotes_count'
  | 'baskets_count'
  | '-baskets_count'
  | 'status'
  | '-status';

export type SortAttribute =
  | 'new'
  | 'trending'
  | 'popular'
  | 'author_name'
  | 'upvotes_count'
  | 'downvotes_count'
  | 'baskets_count'
  | 'status';

export interface IIdeaData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    body_multiloc: Multiloc;
    author_name: string;
    slug: string;
    publication_status: IdeaPublicationStatus;
    upvotes_count: number;
    downvotes_count: number;
    comments_count: number;
    official_feedbacks_count: number;
    baskets_count: number;
    location_point_geojson: GeoJSON.Point | null;
    location_description: string | null;
    budget: number | null;
    proposed_budget: number | null;
    created_at: string;
    updated_at: string;
    published_at: string;
    action_descriptor: {
      voting_idea: {
        enabled: boolean;
        disabled_reason: IdeaVotingDisabledReason | null;
        cancelling_enabled: boolean;
        up: {
          enabled: boolean;
          disabled_reason: IdeaVotingDisabledReason | null;
          future_enabled: string | null;
        };
        down: {
          enabled: boolean;
          disabled_reason: IdeaVotingDisabledReason | null;
          future_enabled: string | null;
        };
      };
      commenting_idea: {
        enabled: boolean;
        future_enabled: string | null;
        disabled_reason: IdeaCommentingDisabledReason | null;
      };
      comment_voting_idea: {
        enabled: boolean;
        disabled_reason: IdeaCommentingDisabledReason | null;
        future_enabled: null;
      };
      budgeting?: {
        enabled: boolean;
        future_enabled: string | null;
        disabled_reason: IdeaBudgetingDisabledReason;
      };
    };
  };
  relationships: {
    topics?: {
      data: IRelationship[];
    };
    idea_images: {
      data: IRelationship[] | null;
    };
    author: {
      data: IRelationship | null;
    };
    assignee?: {
      data: IRelationship | null;
    };
    phases: {
      data: IRelationship[];
    };
    project: {
      data: IRelationship;
    };
    idea_status: {
      data: IRelationship;
    };
    user_vote?: {
      data: IRelationship | null;
    };
  };
}

export interface IIdeaAdd {
  // Required
  project_id: string;
  publication_status: IdeaPublicationStatus;
  title_multiloc: Multiloc;
  // Optional
  author_id?: string | null;
  assignee_id?: string | null;
  idea_status_id?: string | null;
  body_multiloc?: Multiloc;
  topic_ids?: string[] | null;
  phase_ids?: string[] | null;
  location_point_geojson?: GeoJSON.Point | null;
  location_description?: string | null;
  budget?: number | null;
  proposed_budget?: number | null;
}

export interface IIdeaUpdate {
  // All optional
  project_id?: string | null;
  publication_status?: IdeaPublicationStatus;
  title_multiloc?: Multiloc;
  author_id?: string | null;
  assignee_id?: string | null;
  idea_status_id?: string | null;
  body_multiloc?: Multiloc;
  topic_ids?: string[] | null;
  phase_ids?: string[] | null;
  location_point_geojson?: GeoJSON.Point | null;
  location_description?: string | null;
  budget?: number | null;
  proposed_budget?: number | null;
}

export interface IIdeas {
  data: IIdeaData[];
  links: ILinks;
}

export interface IIdea {
  data: IIdeaData;
}

export interface IQueryParameters {
  sort: Sort;
  'page[number]'?: number;
  'page[size]'?: number;
  projects?: string[] | null;
  phase?: string | null;
  author?: string | null;
  search?: string;
  topics?: string[] | null;
  idea_status?: string | null;
  publication_status?: IdeaPublicationStatus | null;
  project_publication_status?: ProjectPublicationStatus | null;
  bounding_box?: number[] | null;
  assignee?: string | null;
  feedback_needed?: boolean | null;
  filter_can_moderate?: boolean | null;
  basket_id?: string;
}
