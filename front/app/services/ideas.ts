import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';
import { firstValueFrom } from 'rxjs';
import { get } from 'lodash-es';
import { CommentingDisabledReason } from './projects';

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

export interface IIdeas {
  data: IIdeaData[];
  links: IIdeaLinks;
}
export interface IIdeaAdd {
  author_id: string | null;
  project_id: string | null;
  assignee_id?: string | null;
  idea_status_id?: string | null;
  publication_status: IdeaPublicationStatus;
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  topic_ids: string[] | null;
  phase_ids?: string[] | null;
  location_point_geojson: GeoJSON.Point | null;
  location_description: string | null;
  budget: number | null;
  proposed_budget: number | null;
}

export interface IIdeasFilterCounts {
  idea_status_id: {
    [key: string]: number;
  };
  topic_id: {
    [key: string]: number;
  };
  total: number;
}

export function ideaByIdStream(ideaId: string) {
  return streams.get<IIdea>({ apiEndpoint: `${API_PATH}/ideas/${ideaId}` });
}

export function ideaBySlugStream(ideaSlug: string) {
  return streams.get<IIdea>({
    apiEndpoint: `${API_PATH}/ideas/by_slug/${ideaSlug}`,
  });
}

export function ideasStream(streamParams: IStreamParams | null = null) {
  return streams.get<IIdeas>({
    apiEndpoint: `${API_PATH}/ideas`,
    ...streamParams,
  });
}
export function ideasMiniStream(streamParams: IStreamParams | null = null) {
  return streams.get<IIdeas>({
    apiEndpoint: `${API_PATH}/ideas/mini`,
    ...streamParams,
    cacheStream: false,
  });
}

export function ideasFilterCountsStream(
  streamParams: IStreamParams | null = null
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

export async function addIdea(object: IIdeaAdd) {
  const response = await streams.add<IIdea>(`${API_PATH}/ideas/`, {
    idea: object,
  });
  streams.fetchAllWith({
    dataId: [response.data.relationships.project.data.id],
    apiEndpoint: [`${API_PATH}/users/${object.author_id}/ideas_count`],
  });
  return response;
}

export async function updateIdea(ideaId: string, object: Partial<IIdeaAdd>) {
  const response = await streams.update<IIdea>(
    `${API_PATH}/ideas/${ideaId}`,
    ideaId,
    { idea: object }
  );

  streams.fetchAllWith({
    dataId: [response.data.relationships.project.data.id],
    apiEndpoint: [
      `${API_PATH}/stats/ideas_count`,
      `${API_PATH}/ideas`,
      `${API_PATH}/ideas/${ideaId}/activities`,
      `${API_PATH}/analytics`,
    ],
    partialApiEndpoint: [`${API_PATH}/ideas/${ideaId}/images`],
  });

  return response;
}

export async function deleteIdea(ideaId: string) {
  const [idea, response] = await Promise.all([
    firstValueFrom(ideaByIdStream(ideaId).observable),
    streams.delete(`${API_PATH}/ideas/${ideaId}`, ideaId),
  ]);

  const authorId = get(idea, 'relationships.author.data.id', false);
  const projectId = idea.data.relationships.project.data.id;

  streams.fetchAllWith({
    dataId: [projectId],
    apiEndpoint: authorId
      ? [
          `${API_PATH}/users/${authorId}/ideas_count`,
          `${API_PATH}/stats/ideas_count`,
        ]
      : [`${API_PATH}/stats/ideas_count`],
  });

  return response;
}
