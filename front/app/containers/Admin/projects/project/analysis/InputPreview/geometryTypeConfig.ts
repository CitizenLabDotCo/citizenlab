import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import { colors } from '@citizenlab/cl2-component-library';

import {
  getFillSymbol,
  getLineSymbol,
  getShapeSymbol,
} from 'components/EsriMap/utils';

export interface IGeometryTypeConfig {
  renderer: SimpleRenderer;
}

export type EsriGeometryType = 'point' | 'polygon' | 'polyline' | 'multipoint';

export const pointConfig: IGeometryTypeConfig = {
  renderer: new SimpleRenderer({
    symbol: getShapeSymbol({
      shape: 'circle',
      color: colors.primary,
      sizeInPx: 8,
    }),
  }),
};

export const lineConfig: IGeometryTypeConfig = {
  renderer: new SimpleRenderer({
    symbol: getLineSymbol({
      color: colors.primary,
    }),
  }),
};

export const polygonConfig: IGeometryTypeConfig = {
  renderer: new SimpleRenderer({
    symbol: getFillSymbol({
      transparency: 0.1,
      color: colors.primary,
      outlineStyle: 'solid',
      outlineColor: colors.primary,
    }),
  }),
};

// getGeometryTypeConfig
// Description: Returns the correct geometry type configuration
export const getGeometryTypeConfig = (geometryType: EsriGeometryType) => {
  switch (geometryType) {
    case 'point':
      return pointConfig;
    case 'polygon':
      return polygonConfig;
    case 'polyline':
      return lineConfig;
    default:
      return null;
  }
};
