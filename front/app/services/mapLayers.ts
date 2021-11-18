import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc, UploadFile } from 'typings';

export interface IMapLayerAttributes {
  id: string;
  title_multiloc: Multiloc;
  geojson?: GeoJSON.FeatureCollection;
  default_enabled: boolean;
  geojson_file?: UploadFile;
  marker_svg_url?: string;
}

export interface IMapLayerUpdateAttributes {
  title_multiloc?: Multiloc;
  geojson: GeoJSON.FeatureCollection;
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

export const mapLayerByProjectMapConfigStream = (
  projectId: string,
  mapLayerId: string
) => {
  return streams.get<IMapLayer>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/map_config/layers/${mapLayerId}`,
  });
};
