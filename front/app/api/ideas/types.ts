import { ILinks, Multiloc, IRelationship } from 'typings';
import {
  PermissionsDisabledReason,
  ActionDescriptorFutureEnabled,
} from 'utils/actionDescriptors';
import {
  CommentingDisabledReason,
  PublicationStatus as ProjectPublicationStatus,
} from 'api/projects/types';
import { Keys } from 'utils/cl-react-query/types';
import ideasKeys from './keys';

export type IdeasKeys = Keys<typeof ideasKeys>;

export type IdeaPublicationStatus = 'draft' | 'published' | 'archived' | 'spam';

export type IdeaReactingDisabledReason =
  | 'project_inactive'
  | 'not_ideation'
  | 'reacting_disabled'
  | 'disliking_disabled'
  | 'reacting_like_limited_max_reached'
  | 'reacting_dislike_limited_max_reached'
  | 'idea_not_in_current_phase'
  | PermissionsDisabledReason;

export type IdeaCommentingDisabledReason =
  | 'idea_not_in_current_phase'
  | CommentingDisabledReason;

export type IdeaVotingDisabledReason =
  | 'project_inactive'
  | 'not_voting'
  | 'idea_not_in_current_phase'
  | PermissionsDisabledReason;

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
  | 'likes_count'
  | '-likes_count'
  | 'dislikes_count'
  | '-dislikes_count'
  | 'baskets_count'
  | '-baskets_count'
  | 'status'
  | '-status'
  | 'votes_count'
  | '-votes_count'
  | 'comments_count'
  | '-comments_count'
  | 'budget'
  | '-budget';

export type SortAttribute =
  | 'new'
  | 'trending'
  | 'popular'
  | 'author_name'
  | 'likes_count'
  | 'dislikes_count'
  | 'baskets_count'
  | 'status'
  | 'votes_count'
  | 'comments_count'
  | 'budget';

type ReactingIdeaActionDescriptor =
  | { enabled: true; disabled_reason: null; cancelling_enabled: boolean }
  | {
      enabled: false;
      disabled_reason: IdeaReactingDisabledReason;
      cancelling_enabled: boolean;
    };

export interface IIdeaData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    body_multiloc: Multiloc;
    author_name: string | null;
    slug: string;
    publication_status: IdeaPublicationStatus;
    likes_count: number;
    dislikes_count: number;
    comments_count: number;
    internal_comments_count: number;
    official_feedbacks_count: number;
    baskets_count?: number | null;
    votes_count?: number | null;
    location_point_geojson: GeoJSON.Point | null;
    location_description: string | null;
    budget: number | null;
    proposed_budget: number | null;
    created_at: string;
    updated_at: string;
    published_at: string;
    action_descriptor: {
      reacting_idea: ReactingIdeaActionDescriptor & {
        up: ActionDescriptorFutureEnabled<IdeaReactingDisabledReason>;
        down: ActionDescriptorFutureEnabled<IdeaReactingDisabledReason>;
      };
      commenting_idea: ActionDescriptorFutureEnabled<IdeaCommentingDisabledReason>;
      // Confusingly, 'comment_reacting_idea' is an action descriptor, but
      // not an action, and it doesn't have its own granular permissions.
      // In other words, you can't specifically say that you don't want
      // people to be able to reaction on comments. This is instead derived from 'commenting_idea'.
      // Why is it an action descriptor then, and why don't we just use 'commenting_idea'?
      // Because of legacy reasons. Should be fixed in the future.
      // For now, just know that 'comment_reacting_idea' is just an action descriptor,
      // but not an action (so e.g. it can't be used in the authentication_requirements API).
      comment_reacting_idea: ActionDescriptorFutureEnabled<IdeaCommentingDisabledReason>;
      voting?: ActionDescriptorFutureEnabled<IdeaVotingDisabledReason>;
    };
    anonymous: boolean;
    author_hash: string;
    followers_count: number;
  };
  relationships: {
    assignee?: {
      data: IRelationship | null;
    };
    author?: {
      data: IRelationship | null;
    };
    idea_images: {
      data: IRelationship[] | null;
    };
    idea_status: {
      data: IRelationship;
    };
    ideas_phases: {
      data: {
        id: string;
        type: 'ideas_phase';
      }[];
    };
    phases: {
      data: IRelationship[];
    };
    project: {
      data: IRelationship;
    };
    topics?: {
      data: IRelationship[];
    };
    user_follower: {
      data: IRelationship | null;
    };
    user_reaction?: {
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
  anonymous?: boolean;
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
  anonymous?: boolean;
  idea_images_attributes?: { image: string }[];
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
