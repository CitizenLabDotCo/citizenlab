import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';

export interface IMapConfigData {
  id: string;
  type: string;
  attributes: {
    zoom_level?: string;
    tile_provider?: string;
    center_geojson?: GeoJSON.Point;
    layers: {
      title_multiloc: Multiloc;
      geojson: GeoJSON.GeoJsonObject;
      default_enabled: boolean;
      marker_svg_url?: string;
    }[];
    legend: {
      title_multiloc: Multiloc;
      color: string;
    }[];
  };
}

export interface IMapConfig {
  data: IMapConfigData;
}

export const mapConfigByProjectStream = (projectId: string) => {
  return streams.get<IMapConfig>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/map_config`,
  });
};
