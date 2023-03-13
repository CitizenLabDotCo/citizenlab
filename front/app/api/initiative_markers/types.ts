import { Multiloc } from 'typings';
import { Keys } from 'utils/cl-react-query/types';

import initiativeMarkersKeys from './keys';

export type InitiativeMarkersKeys = Keys<typeof initiativeMarkersKeys>;

export interface IGeotaggedInitiativeData {
  id: string;
  type: 'post_marker';
  attributes: {
    title_multiloc: Multiloc;
    location_point_geojson: GeoJSON.Point;
    location_description: string;
  };
}

export type IInitiativeMarkers = {
  data: IGeotaggedInitiativeData[];
};
