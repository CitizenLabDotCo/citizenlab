import { IRelationship, Multiloc, ImageSizes, ILinks } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import initiativesKeys from './keys';

export type InitiativesKeys = Keys<typeof initiativesKeys>;

export type Sort =
  | 'trending'
  | 'new'
  | '-new'
  | 'author_name'
  | '-author_name'
  | 'likes_count'
  | '-likes_count'
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
  cosponsor_ids?: string[];
}

export type InitiativePublicationStatus =
  | 'draft'
  | 'published'
  | 'archived'
  | 'spam';

export interface IInitiativeCosponsorship {
  name: string;
  status: 'pending' | 'accepted';
  user_id: string;
}

export interface IInitiativeData {
  id: string;
  type: 'initiative';
  attributes: {
    title_multiloc: Multiloc;
    body_multiloc: Multiloc;
    author_name: string;
    slug: string;
    publication_status: InitiativePublicationStatus;
    likes_count: number;
    comments_count: number;
    internal_comments_count: number;
    location_point_geojson: GeoJSON.Point;
    location_description: string;
    budget: number | null;
    created_at: string;
    updated_at: string;
    published_at: string;
    header_bg: ImageSizes;
    expires_at: string;
    anonymous: boolean;
    // BE returns an empty [] if not set yet.
    cosponsorships: IInitiativeCosponsorship[];
    editing_locked: boolean;
    public: boolean;
    followers_count: number;
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
    user_reaction?: {
      data: IRelationship | null;
    };
    cosponsors?: {
      data: {
        type: 'user';
        id: string;
      }[];
    };
    user_follower: {
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
  title_multiloc: Multiloc;
  publication_status: InitiativePublicationStatus;
  // Strictly speaking not necessary (BE schema doesn't require it) at time of writing (25 Aug '23)
  // But including it because from the product perspective it doesn't make sense to not have it.
  body_multiloc: Multiloc;
  anonymous?: boolean;
  header_bg?: string;
  author_id?: string | null;
  assignee_id?: string | null;
  // should actually be required by the BE as we require >=1 topic
  topic_ids?: string[] | null;
  area_ids?: string[] | null;
  location_point_geojson?: GeoJSON.Point | null;
  location_description?: string | null;
  cosponsor_ids?: string[];
}

interface IInitiativeUpdate {
  title_multiloc?: Multiloc;
  publication_status?: InitiativePublicationStatus;
  body_multiloc?: Multiloc;
  anonymous?: boolean;
  // null is required to be able to remove the header_bg
  header_bg?: string | null;
  author_id?: string | null;
  assignee_id?: string | null;
  topic_ids?: string[] | null;
  area_ids?: string[] | null;
  location_point_geojson?: GeoJSON.Point | null;
  location_description?: string | null;
  cosponsor_ids?: string[];
}

export interface IUpdateInitiativeObject {
  initiativeId: string;
  requestBody: IInitiativeUpdate;
}
