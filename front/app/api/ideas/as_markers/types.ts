import { Multiloc, ILinks } from 'typings';

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

export interface IIdeaMarkers {
  data: IIdeaMarkerData[];
  links: ILinks;
}
