import { Multiloc } from 'typings';
import { IMapLayerAttributes } from './mapLayers';

export interface IMapConfigAttributes {
  zoom_level?: string;
  tile_provider?: string;
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
