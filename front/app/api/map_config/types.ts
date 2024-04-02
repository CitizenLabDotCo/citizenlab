import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import { IMapLayerAttributes } from '../map_layers/types';

import mapConfigKeys from './keys';

export type MapConfigKeys = Keys<typeof mapConfigKeys>;

export interface IMapConfigAttributes {
  zoom_level?: string;
  tile_provider?: string | null;
  center_geojson?: GeoJSON.Point;
  esri_web_map_id?: string | null;
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
