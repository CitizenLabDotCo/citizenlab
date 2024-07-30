import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import { colors } from '@citizenlab/cl2-component-library';

import {
  getShapeSymbol,
  getFillSymbol,
  getLineSymbol,
} from 'components/EsriMap/utils';

// setLayerRenderer
// Description: Sets the correct graphics renderer from the geometry type
export const setLayerRenderer = (layer: GeoJSONLayer) => {
  if (layer.geometryType === 'point') {
    layer.renderer = new SimpleRenderer({
      symbol: getShapeSymbol({
        shape: 'circle',
        color: colors.primary,
        sizeInPx: 8,
      }),
    });
  } else if (layer.geometryType === 'polygon') {
    layer.renderer = new SimpleRenderer({
      symbol: getFillSymbol({
        transparency: 0.1,
        color: colors.primary,
        outlineStyle: 'solid',
        outlineColor: colors.primary,
      }),
    });
  } else if (layer.geometryType === 'polyline') {
    layer.renderer = new SimpleRenderer({
      symbol: getLineSymbol({
        color: colors.primary,
      }),
    });
  }
};
