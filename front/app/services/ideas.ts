import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

// typings
import { Multiloc } from 'typings';
import {
  CommentingDisabledReason,
  PublicationStatus as ProjectPublicationStatus,
} from 'services/projects';
import { IIdeaData } from 'api/ideas/types';

export type IdeaPublicationStatus = 'draft' | 'published' | 'archived' | 'spam';

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

export interface IMinimalIdeaData {
  id: string;
  type: string;
  attributes: {
    slug: string;
    title_multiloc: Multiloc;
  };
}

export interface IIdeaMarkerData {
  id: string;
  type: string;
  attributes: {
    slug: string;
    title_multiloc: Multiloc;
    location_point_geojson: GeoJSON.Point;
    location_description: string;
    upvotes_count: number;
    downvotes_count: number;
    comments_count: number;
    budget: number | null;
  };
}

export interface IIdeaLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface IIdea {
  data: IIdeaData;
}

export interface IIdeasFilterCounts {
  data: {
    attributes: {
      idea_status_id: {
        [key: string]: number;
      };
      topic_id: {
        [key: string]: number;
      };
      total: number;
    };
  };
}

export interface IIdeasQueryParameters {
  'page[number]': number;
  'page[size]': number;
  sort: Sort;
  projects?: string[] | null;
  phase?: string | null;
  author?: string | null;
  search?: string | null;
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

export interface IIdeasFilterCountsQueryParameters
  extends Omit<IIdeasQueryParameters, 'page[number]' | 'page[size]' | 'sort'> {
  sort?: Sort;
}

export function ideasFilterCountsStream(
  streamParams: {
    queryParameters: IIdeasFilterCountsQueryParameters;
  } | null = null
) {
  return streams.get<IIdeasFilterCounts>({
    apiEndpoint: `${API_PATH}/ideas/filter_counts`,
    ...streamParams,
    cacheStream: false,
  });
}

export function ideasMarkersStream(streamParams: IStreamParams | null = null) {
  return streams.get<{ data: IIdeaMarkerData[]; links: IIdeaLinks }>({
    apiEndpoint: `${API_PATH}/ideas/as_markers`,
    ...streamParams,
    cacheStream: false,
  });
}

export function similarIdeasStream(
  ideaId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<{ data: IMinimalIdeaData[] }>({
    apiEndpoint: `${API_PATH}/ideas/${ideaId}/similar`,
    ...streamParams,
    cacheStream: false,
  });
}

export { IIdeaData };
