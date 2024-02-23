// getFeatureLayerInitialTitleMultiloc

import { IMapConfig } from 'api/map_config/types';

// Description: This function is used to generate the initial title multiloc for an Esri feature layer.
export const getFeatureLayerInitialTitleMultiloc = (
  layerTitle: string,
  tenantLocales: string[]
) => {
  const title_multiloc = {};
  tenantLocales.forEach(
    (tenantLocale) => (title_multiloc[`${tenantLocale}`] = layerTitle)
  );
  return title_multiloc;
};

// getLayerType
// Description: Returns the layer type of a MapConfig. All layers in a Map Config will have the same type.
export const getLayerType = (mapConfig: IMapConfig) => {
  const layers = mapConfig?.data?.attributes?.layers;
  return layers?.[0]?.type;
};
