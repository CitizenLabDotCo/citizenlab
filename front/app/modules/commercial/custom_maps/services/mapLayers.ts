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

export const createProjectMapLayer = async (
  projectId: string,
  mapLayer: IMapLayerAttributes
) => {
  const response = await streams.add<IMapLayer>(
    `${API_PATH}/projects/${projectId}/map_config/layers`,
    { layer: mapLayer }
  );

  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/projects/${projectId}/map_config`],
  });

  return response;
};

export const updateProjectMapLayer = async (
  projectId: string,
  mapLayerId: string,
  mapLayer: IMapLayerUpdateAttributes
) => {
  const response = await streams.update<IMapLayer>(
    `${API_PATH}/projects/${projectId}/map_config/layers/${mapLayerId}`,
    mapLayerId,
    { layer: mapLayer }
  );

  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/projects/${projectId}/map_config`],
  });

  return response;
};

export const reorderProjectMapLayer = async (
  projectId: string,
  mapLayerId: string,
  ordering: number
) => {
  const response = await streams.update<IMapLayer>(
    `${API_PATH}/projects/${projectId}/map_config/layers/${mapLayerId}/reorder`,
    mapLayerId,
    { layer: { ordering } }
  );

  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/projects/${projectId}/map_config`],
  });

  return response;
};

export const deleteProjectMapLayer = async (
  projectId: string,
  mapLayerId: string
) => {
  const response = await streams.delete(
    `${API_PATH}/projects/${projectId}/map_config/layers/${mapLayerId}`,
    mapLayerId
  );

  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/projects/${projectId}/map_config`],
  });

  return response;
};
