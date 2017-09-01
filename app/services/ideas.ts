import { IRelationship } from 'typings.d';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';
import { IOption } from 'typings';

export interface IIdeaData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: {
      [key: string]: any;
    };
    body_multiloc: {
      [key: string]: any;
    };
    author_name: string;
    slug: string;
    publication_status: 'draft' | 'published';
    upvotes_count: number;
    downvotes_count: number;
    comments_count: number;
    location_point_geojson: string;
    location_description: string;
    created_at: string;
    updated_at: string;
    published_at: string;
  };
  relationships: {
    topics: {
      data: IRelationship[]
    };
    areas: {
      data: IRelationship[]
    };
    idea_images: {
      data: IRelationship[]
    };
    author: {
      data: IRelationship
    };
    project: {
      data: IRelationship
    };
    user_vote: {
      data: null
    }
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

export interface IIdeaUpdate {
  project_id?: string;
  author_id?: string;
  idea_status_id?: string;
  publication_status?: 'draft' | 'published' | 'closed' | 'spam';
  title_multiloc: { [key: string]: string; };
  body_multiloc: { [key: string]: string; };
  topic_ids: string[];
  area_ids: string[];
  location_point_geojson: string;
  location_description: string;
}

const apiEndpoint = `${API_PATH}/ideas`;

export function observeIdea(ideaId: string, streamParams: IStreamParams<IIdea> | null = null) {
  return streams.create<IIdea>({ apiEndpoint: `${apiEndpoint}/${ideaId}`, ...streamParams });
}

export function observeIdeas(streamParams: IStreamParams<IIdeas> | null = null) {
  return streams.create<IIdeas>({ apiEndpoint, ...streamParams });
}

export function addIdea(
  userId: string,
  publicationStatus: 'draft' | 'published',
  title: { [key: string]: string },
  body: { [key: string]: string },
  topicIds: string[] | null,
  projectId: string | null,
  locationGeoJSON: {} | null,
  locationDescription: string | null,
) {
  const bodyData = {
    idea: {
      project_id: projectId,
      author_id: userId,
      publication_status: publicationStatus,
      title_multiloc: title,
      body_multiloc: body,
      topic_ids: topicIds,
      area_ids: null,
      location_point_geojson: locationGeoJSON,
      location_description: locationDescription
    }
  };

  return streams.add<IIdea>(apiEndpoint, bodyData);
}

export function updateIdea(ideaId: string, object: IIdeaUpdate) {
  return streams.update<IIdea>(`${apiEndpoint}/${ideaId}`, ideaId, { idea: object });
}
