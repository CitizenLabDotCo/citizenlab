import { IRelationship, Multiloc, ImageSizes, ILinks } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import initiativesKeys from './keys';

export type InitiativesKeys = Keys<typeof initiativesKeys>;

export type Sort =
  | 'new'
  | '-new'
  | 'author_name'
  | '-author_name'
  | 'upvotes_count'
  | '-upvotes_count'
  | 'status'
  | '-status'
  | 'random';

export interface IQueryParameters {
  pageNumber?: number;
  pageSize?: number;
  author?: string | undefined | null;
  sort?: Sort;
  search?: string | undefined | null;
  topics?: string[] | undefined | null;
  areas?: string[] | undefined | null;
  initiative_status?: string | undefined | null;
  publication_status?: InitiativePublicationStatus | undefined | null;
  bounding_box?: number[] | undefined | null;
  assignee?: string | undefined | null;
  feedback_needed?: boolean | undefined | null;
}

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
