import { Keys } from 'utils/cl-react-query/types';
import mapConfigKeys from './keys';
import { IMapLayerAttributes } from '../map_layers/types';
import { Multiloc } from 'typings';

export type MapConfigKeys = Keys<typeof mapConfigKeys>;

export interface IMapConfigAttributes {
  zoom_level?: string;
  tile_provider?: string | null;
  center_geojson?: GeoJSON.Point;
}

export interface IMapConfigRelationships {
  layers: IMapLayerAttributes[];
  legend: {
    title_multiloc: Multiloc;
    color: string;
  }[];
}

export interface IMapConfigData {
  id: string;
  type: string;
  attributes: IMapConfigAttributes & IMapConfigRelationships;
}

export interface IMapConfig {
  data: IMapConfigData;
}
