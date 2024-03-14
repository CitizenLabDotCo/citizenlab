import { Multiloc, UploadFile } from 'typings';

export interface IMapLayerAttributes {
  id: string;
  type: 'CustomMaps::GeojsonLayer' | 'CustomMaps::EsriFeatureLayer';
  layer_url?: string;
  title_multiloc: Multiloc;
  geojson?: GeoJSON.FeatureCollection;
  default_enabled: boolean;
  geojson_file?: UploadFile;
  marker_svg_url?: string;
}

export interface IMapLayerUpdateAttributes {
  id: string;
  mapConfigId: string;
  layer_url?: string;
  title_multiloc?: Multiloc;
  geojson?: GeoJSON.FeatureCollection;
  default_enabled?: boolean;
  geojson_file?: UploadFile;
  marker_svg_url?: string;
}

export interface IMapLayerData {
  id: string;
  type: string;
  attributes: IMapLayerAttributes;
}

export interface IMapLayer {
  data: IMapLayerData;
}
