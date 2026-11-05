import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';

import { getGeometryTypeConfig } from './geometryTypeConfig';

// setLayerRenderer
// Description: Sets the correct graphics renderer from the geometry type
export const setLayerRenderer = (layer: GeoJSONLayer) => {
  if (!layer.geometryType) return;
  const renderer = getGeometryTypeConfig(layer.geometryType)?.renderer;
  if (renderer) {
    layer.renderer = renderer;
  }
};
