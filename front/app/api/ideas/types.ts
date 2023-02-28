import { Keys } from 'utils/cl-react-query/types';
import ideasKeys from './keys';
import { IRelationship, Multiloc } from 'typings';
import { CommentingDisabledReason } from 'services/projects';

export type IdeasKeys = Keys<typeof ideasKeys>;
export type IdeaPublicationStatus = 'draft' | 'published' | 'archived' | 'spam';

export interface IIdea {
  data: IIdeaData;
}

// keys in ideas.attributes.action_descriptor
export type IIdeaAction =
  | 'voting_idea'
  | 'commenting_idea'
  | 'comment_voting_idea'
  | 'budgeting';

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
