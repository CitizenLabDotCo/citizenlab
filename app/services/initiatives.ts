import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc, ImageSizes, ILinks } from 'typings';
import { first } from 'rxjs/operators';
import { get } from 'lodash-es';

export type InitiativePublicationStatus = 'draft' | 'published' | 'archived' | 'spam';

export interface IInitiativeData {
  id: string;
  type: 'initiatives';
  attributes: {
    title_multiloc: Multiloc;
    body_multiloc: Multiloc;
    author_name: string;
    slug: string;
    publication_status: InitiativePublicationStatus;
    upvotes_count: number;
    comments_count: number;
    location_point_geojson: GeoJSON.Point;
    location_description: string;
    budget: number | null;
    created_at: string;
    updated_at: string;
    published_at: string;
    header_bg: ImageSizes;
  };
  relationships: {
    topics: {
      data: IRelationship[];
    };
    initiative_images: {
      data: IRelationship[];
    };
    author: {
      data: IRelationship | null;
    };
    assignee: {
      data: IRelationship | null;
    };
    initiative_status?: {
      data: IRelationship | null;
    },
    user_vote: {
      data: IRelationship;
    }
  };
}

export interface IInitiative {
  data: IInitiativeData;
}

export interface IInitiatives {
  data: IInitiativeData[];
  links: ILinks;
}

export interface IInitiativeAdd {
  author_id?: string | null;
  assignee_id?: string | null;
  initiative_status_id?: string | null;
  publication_status?: InitiativePublicationStatus;
  title_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  topic_ids?: string[] | null;
  area_ids?: string[] | null;
  phase_ids?: string[] | null;
  location_point_geojson?: GeoJSON.Point | null;
  location_description?: string | null;
}

export interface IInitiativesCount {
  count: number;
}

export function initiativeByIdStream(initiativeId: string) {
  return streams.get<IInitiative>({ apiEndpoint: `${API_PATH}/initiatives/${initiativeId}` });
}

export function initiativeBySlugStream(initiativeSlug: string) {
  return streams.get<IInitiative>({ apiEndpoint: `${API_PATH}/initiatives/by_slug/${initiativeSlug}` });
}

export function initiativesStream(streamParams: IStreamParams | null = null) {
  return streams.get<IInitiatives>({ apiEndpoint: `${API_PATH}/initiatives`, ...streamParams });
}

export async function addInitiative(object: IInitiativeAdd) {
  const response = await streams.add<IInitiative>(`${API_PATH}/initiatives`, { initiative: object });
  // TODO refetches if necessary
  return response;
}

export async function updateInitiative(initiativeId: string, object: Partial<IInitiativeAdd>) {
  const response = await streams.update<IInitiative>(`${API_PATH}/initiatives/${initiativeId}`, initiativeId, { initiative: object });
  // TODO less refetches? This is the only way I get the initiatives list to refresh when removing a topic
  streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/stats/initiatives_count`, `${API_PATH}/initiatives`]
  });
  return response;
}

export async function deleteInitiative(initiativeId: string) {
  const [initiative, response] = await Promise.all([
    initiativeByIdStream(initiativeId).observable.pipe(first()).toPromise(),
    streams.delete(`${API_PATH}/initiatives/${initiativeId}`, initiativeId)
  ]);

  const authorId = get(initiative, 'relationships.author.data.id', false);

  streams.fetchAllWith({
    apiEndpoint: (authorId ? [`${API_PATH}/users/${authorId}/initiatives_count`, `${API_PATH}/initiatives/filter_counts`] : [`${API_PATH}/initiatives/filter_counts`])
    // TODO apiEndpoint: (authorId ? [`${API_PATH}/users/${authorId}/initiatives_count`] : [])
  });

  return response;
}

export interface IInitiativesFilterCounts {
  idea_status_id: {
    [key: string]: number;
  };
  area_id: {
    [key: string]: number;
  };
  topic_id: {
    [key: string]: number;
  };
  total: number;
}

export function initiativesFilterCountsStream(streamParams: IStreamParams | null = null) {
  return streams.get<IInitiativesFilterCounts>({ apiEndpoint: `${API_PATH}/initiatives/filter_counts`, ...streamParams, cacheStream: false });
}
