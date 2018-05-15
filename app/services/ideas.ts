import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

export type IdeaPublicationStatus = 'draft' | 'published' | 'archived' | 'spam';

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
    location_point_geojson: GeoJSON.Point;
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
      data: IRelationship;
    };
    idea_status?: {
      data: IRelationship;
    },
    user_vote: {
      data: IRelationship;
    },
    action_descriptor: {
      data: {
        voting:{
          enabled: boolean,
          future_enabled: string | null,
          disabled_reason: 'project_inactive' | 'voting_disabled' | 'voting_limited_max_reached' | 'not_in_active_context' | null
          cancelling_enabled: boolean,
        },
        commenting: {
          enabled: boolean,
          future_enabled: string | null,
          disabled_reason: 'project_inactive' | 'commenting_disabled' | null,
        }
      }
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

export interface IIdeaAdd {
  author_id: string | null;
  project_id: string | null;
  idea_status_id?: string | null;
  publication_status: IdeaPublicationStatus;
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  topic_ids: string[] | null;
  area_ids?: string[] | null;
  phase_ids?: string[] | null;
  location_point_geojson: GeoJSON.Point | null;
  location_description: string | null;
}

export function ideaByIdStream(ideaId: string) {
  return streams.get<IIdea>({ apiEndpoint: `${API_PATH}/ideas/${ideaId}` });
}

export function ideaBySlugStream(ideaSlug: string) {
  return streams.get<IIdea>({ apiEndpoint: `${API_PATH}/ideas/by_slug/${ideaSlug}` });
}

export function ideasStream(streamParams: IStreamParams | null = null) {
  return streams.get<IIdeas>({ apiEndpoint: `${API_PATH}/ideas`, ...streamParams });
}

export function ideasMarkersStream(streamParams: IStreamParams | null = null) {
  return streams.get<{data: Partial<IIdeaData>[], links: IIdeaLinks}>({ apiEndpoint: `${API_PATH}/ideas/as_markers`, ...streamParams, cacheStream: false });
}

export function addIdea(object: IIdeaAdd) {
  return streams.add<IIdea>(`${API_PATH}/ideas/`, { idea: object });
}

export function updateIdea(ideaId: string, object: Partial<IIdeaAdd>) {
  return streams.update<IIdea>(`${API_PATH}/ideas/${ideaId}`, ideaId, { idea: object });
}

export function deleteIdea(ideaId: string) {
  return streams.delete(`${API_PATH}/ideas/${ideaId}`, ideaId);
}

export function ideaActivities(ideaId: string) {
  return streams.get<{ data: IdeaActivity[] }>({ apiEndpoint: `${API_PATH}/ideas/${ideaId}/activities` });
}
