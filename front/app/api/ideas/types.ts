import { ILinks, Multiloc, IRelationship } from 'typings';

import {
  CommentingDisabledReason,
  PublicationStatus as ProjectPublicationStatus,
} from 'api/projects/types';

import {
  PermissionsDisabledReason,
  ActionDescriptorFutureEnabled,
} from 'utils/actionDescriptors';
import { Keys } from 'utils/cl-react-query/types';

import ideasKeys from './keys';

export type IdeasKeys = Keys<typeof ideasKeys>;

export type IdeaPublicationStatus = 'draft' | 'published' | 'archived' | 'spam';

export type IdeaReactingDisabledReason =
  | 'project_inactive'
  | 'not_ideation'
  | 'reacting_disabled'
  | 'reacting_dislike_disabled'
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

type ReactingIdeaActionDescriptor =
  | { enabled: true; disabled_reason: null; cancelling_enabled: boolean }
  | {
      enabled: false;
      disabled_reason: IdeaReactingDisabledReason;
      cancelling_enabled: boolean;
    };

export interface IMiniIdeaData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    slug: string;
  };
}

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
    /** Defined for all ideas regardless of participation method.
     * For participation_method voting, this is used for all voting_methods,
     * even single_voting.
     */
    baskets_count: number;
    /** For voting_method budgeting we use the budget of the idea
     * times the number of picks/baskets */
    votes_count: number;
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
      data: IRelationship | null;
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
    idea_import?: {
      data: IRelationship | null;
    };
  };
}

export interface IIdeaAdd {
  // Required
  project_id: string;
  publication_status: IdeaPublicationStatus;
  // Optional
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

export interface IMiniIdeas {
  data: IMiniIdeaData[];
}

export interface IIdea {
  data: IIdeaData;
}

export interface IQueryParameters {
  sort?: Sort;
  'page[number]'?: number;
  'page[size]'?: number;
  projects?: string[];
  phase?: string;
  author?: string;
  search?: string;
  topics?: string[];
  idea_status?: string;
  publication_status?: IdeaPublicationStatus;
  project_publication_status?: ProjectPublicationStatus;
  bounding_box?: number[];
  assignee?: string;
  feedback_needed?: boolean;
  filter_can_moderate?: boolean;
  basket_id?: string;
}

export interface IIdeaApprovals {
  data: {
    type: 'idea_approvals';
    attributes: {
      approved: number;
      not_approved: number;
    };
  };
}
