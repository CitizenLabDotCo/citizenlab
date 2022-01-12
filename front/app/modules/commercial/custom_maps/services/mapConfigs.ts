import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';
import { IMapLayerAttributes } from './mapLayers';

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

export const mapConfigByProjectStream = (projectId: string) => {
  return streams.get<IMapConfig>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/map_config`,
  });
};

export async function createProjectMapConfig(
  projectId: string,
  mapConfig: IMapConfigAttributes
) {
  return await streams.add<IMapConfig>(
    `${API_PATH}/projects/${projectId}/map_config`,
    { map_config: mapConfig }
  );
}

export async function updateProjectMapConfig(
  projectId: string,
  mapConfigId: string,
  mapConfig: IMapConfigAttributes
) {
  return await streams.update<IMapConfig>(
    `${API_PATH}/projects/${projectId}/map_config`,
    mapConfigId,
    { map_config: mapConfig }
  );
}
