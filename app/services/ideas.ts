import { IRelationship } from 'typings.d';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';
import * as Rx from 'rxjs/Rx';

const apiEndpoint = `${API_PATH}/ideas`;

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
    publication_status: 'draft' | 'published' | 'closed' | 'spam';
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

export interface IIdeaIncluded {
  id: string;
  type: string;
  attributes: {
    first_name: string;
    last_name: string;
    slug: string;
    locale: string;
    avatar: {
      small: string;
      medium: string;
      large: string;
    };
    roles: any[];
    bio_multiloc: any;
    created_at: string;
    updated_at: string;
  };
}

export interface IIdeaLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface IIdeas {
  data: IIdeaData[];
  included: IIdeaIncluded[];
  links: IIdeaLinks;
}

export interface IIdea {
  data: IIdeaData;
}

export interface IIdeaUpdate {
  title_multiloc?: {
    [key: string]: any;
  };
  body_multiloc?: {
    [key: string]: any;
  };
  project_id?: string,
  author_id?: string,
  idea_status_id?: string,
  publication_status?: 'draft' | 'published' | 'closed' | 'spam',
  topid_ids?: string[],
  area_ids?: string[],
  location_point_geojson?: any,
  location_description?: string,
}

export function observeIdeas(streamParams: IStreamParams<IIdeas> | null = null) {
  return streams.create<IIdeas>({ apiEndpoint, ...streamParams });
}

export function updateIdea(ideaId: string, object: IIdeaUpdate) {
  const httpMethod = {
    method: 'PUT'
  };

  const bodyData = {
    idea: object
  };

  return request(`${apiEndpoint}/${ideaId}`, bodyData, httpMethod, null).then((response: IIdea) => {
    streams.update(ideaId, response);
  }).catch(() => {
    throw new Error(`error for updateUser() of service Users`);
  });
}
