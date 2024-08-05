import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';

import { getGeometryTypeConfig } from './geometryTypeConfig';

// setLayerRenderer
// Description: Sets the correct graphics renderer from the geometry type
export const setLayerRenderer = (layer: GeoJSONLayer) => {
  const renderer = getGeometryTypeConfig(layer.geometryType)?.renderer;
  if (renderer) {
    layer.renderer = renderer;
  }
};
