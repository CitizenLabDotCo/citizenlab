import { Multiloc } from 'typings';

import { Sort } from 'api/ideas/types';

import { Keys } from 'utils/cl-react-query/types';

import ideaMarkersKeys from './keys';

export type IdeaMarkersKeys = Keys<typeof ideaMarkersKeys>;

export interface QueryParameters {
  phaseId?: string | null;
  projectIds: string[] | null;
  sort?: Sort;
  search?: string | null;
  input_topics?: string[] | null;
}

export interface IIdeaMarkerData {
  id: string;
  type: 'post_marker';
  attributes: {
    slug: string;
    title_multiloc: Multiloc;
    location_point_geojson: GeoJSON.Point | null;
    location_description: string | null;
    likes_count: number;
    dislikes_count: number;
    comments_count: number;
    budget: number | null;
  };
}

export interface IIdeaMarkers {
  data: IIdeaMarkerData[];
}
