import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IRelationship, Multiloc, ImageSizes } from 'typings';
import { first } from 'rxjs/operators';
import { get } from 'lodash-es';

export type InitiativePublicationStatus =
  | 'draft'
  | 'published'
  | 'archived'
  | 'spam';

export interface IInitiativeData {
  id: string;
  type: 'initiative';
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
    expires_at: string;
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
    };
    user_vote?: {
      data: IRelationship | null;
    };
  };
}

export interface IInitiative {
  data: IInitiativeData;
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

export function initiativeByIdStream(initiativeId: string) {
  return streams.get<IInitiative>({
    apiEndpoint: `${API_PATH}/initiatives/${initiativeId}`,
  });
}

export async function updateInitiative(
  initiativeId: string,
  object: Partial<IInitiativeAdd>
) {
  const response = await streams.update<IInitiative>(
    `${API_PATH}/initiatives/${initiativeId}`,
    initiativeId,
    { initiative: object }
  );
  streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/stats/initiatives_count`,
      `${API_PATH}/initiatives`,
      `${API_PATH}/initiatives/${initiativeId}/activities`,
    ],
  });
  return response;
}

export async function deleteInitiative(initiativeId: string) {
  const [initiative, response] = await Promise.all([
    initiativeByIdStream(initiativeId).observable.pipe(first()).toPromise(),
    streams.delete(`${API_PATH}/initiatives/${initiativeId}`, initiativeId),
  ]);

  const authorId = get(initiative, 'relationships.author.data.id', false);

  streams.fetchAllWith({
    apiEndpoint: authorId
      ? [`${API_PATH}/users/${authorId}/initiatives_count`]
      : [],
  });

  return response;
}
