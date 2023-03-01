// typings
import { IRelationship, Multiloc } from 'typings';
import { CommentingDisabledReason } from 'services/projects';

import { Keys } from 'utils/cl-react-query/types';
import ideasKeys from './keys';

export type IdeasKeys = Keys<typeof ideasKeys>;

export interface IIdea {
  data: IIdeaData;
}

type IdeaPublicationStatus = 'draft' | 'published' | 'archived' | 'spam';

type IdeaVotingDisabledReason =
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

type IdeaCommentingDisabledReason =
  | 'idea_not_in_current_phase'
  | CommentingDisabledReason;

type IdeaBudgetingDisabledReason =
  | 'project_inactive'
  | 'idea_not_in_current_phase'
  | 'not_permitted'
  | 'not_verified'
  | 'not_signed_in'
  | null
  | undefined;

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
      data: IRelationship;
    };
  };
}

export interface IIdeaAdd {
  // Required
  project_id: string | null;
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
