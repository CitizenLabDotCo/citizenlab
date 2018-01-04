import * as _ from 'lodash';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

export interface IIdeaData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    body_multiloc: Multiloc;
    author_name: string;
    slug: string;
    publication_status: 'draft' | 'published';
    upvotes_count: number;
    downvotes_count: number;
    comments_count: number;
    location_point_geojson: {
      type: 'Point';
      coordinates: [number, number];
    };
    location_description: string;
    created_at: string;
    updated_at: string;
    published_at: string;
  };
  relationships: {
    topics: {
      data: IRelationship[];
    };
    areas: {
      data: IRelationship[];
    };
    idea_images: {
      data: IRelationship[];
    };
    author: {
      data: IRelationship | null;
    };
    phases: {
      data: IRelationship[];
    }
    project: {
      data: IRelationship | null;
    };
    idea_status?: {
      data: IRelationship;
    },
    user_vote: {
      data: IRelationship;
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

export interface IdeaActivity {
  id: string;
  type: 'activities';
  attributes: {
    action: string;
    acted_at: string;
    change: string[] | {[key: string]: string}[] | null;
  };
  relationships: {
    user: { data: IRelationship };
  };
}

export interface IIdeaUpdate {
  project_id?: string | undefined | null;
  author_id?: string | undefined | null;
  idea_status_id?: string | undefined | null;
  publication_status?: 'draft' | 'published' | 'closed' | 'spam' | undefined | null;
  title_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  topic_ids?: string[] | undefined | null;
  area_ids?: string[] | undefined | null;
  phase_ids?: string[] | undefined | null;
  location_point_geojson?: {
    type: string;
    coordinates: number[];
  } | undefined | null;
  location_description?: string | undefined | null;
}

export function ideaByIdStream(ideaId: string) {
  return streams.get<IIdea>({ apiEndpoint: `${API_PATH}/ideas/${ideaId}` });
}

export function ideaBySlugStream(ideaSlug: string) {
  return streams.get<IIdea>({ apiEndpoint: `${API_PATH}/ideas/by_slug/${ideaSlug}` });
}

export function ideasStream(streamParams: IStreamParams<IIdeas> | null = null) {
  return streams.get<IIdeas>({ apiEndpoint: `${API_PATH}/ideas`, ...streamParams });
}

export function addIdea(
  authorId: string | null,
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
      author_id: authorId,
      project_id: projectId,
      publication_status: publicationStatus,
      title_multiloc: title,
      body_multiloc: body,
      topic_ids: topicIds,
      area_ids: null,
      location_point_geojson: locationGeoJSON,
      location_description: locationDescription
    }
  };

  return streams.add<IIdea>(`${API_PATH}/ideas/`, bodyData);
}

export function updateIdea(ideaId: string, object: IIdeaUpdate) {
  return streams.update<IIdea>(`${API_PATH}/ideas/${ideaId}`, ideaId, { idea: object });
}

export function deleteIdea(ideaId: string) {
  return streams.delete(`${API_PATH}/ideas/${ideaId}`, ideaId);
}

export function ideaActivities(ideaId: string) {
  return streams.get<{ data: IdeaActivity[] }>({ apiEndpoint: `${API_PATH}/ideas/${ideaId}/activities` });
}
