// getFeatureLayerInitialTitleMultiloc

import { IMapConfig } from 'api/map_config/types';

// Description: This function is used to generate the initial title multiloc for an Esri feature layer.
export const getFeatureLayerInitialTitleMultiloc = (
  layerTitle: string,
  tenantLocales: string[],
  subLayerCount: number
) => {
  const title_multiloc = {};
  const title = // If there are sublayers, append the sublayer count to the title
    subLayerCount > 1 ? `${layerTitle} (${subLayerCount})` : `${layerTitle}`;

  tenantLocales.forEach(
    (tenantLocale) => (title_multiloc[`${tenantLocale}`] = title)
  );
  return title_multiloc;
};

// getLayerType
// Description: Returns the layer type of a MapConfig. All layers in a Map Config will have the same type.
export const getLayerType = (mapConfig: IMapConfig) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const layers = mapConfig?.data?.attributes?.layers;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return layers?.[0]?.type;
};
