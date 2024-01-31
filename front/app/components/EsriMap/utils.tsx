import { colors } from '@citizenlab/cl2-component-library';

// constants
import {
  BASEMAP_AT_DEFAULT_OPTIONS,
  DEFAULT_TILE_OPTIONS,
  MAPTILER_DEFAULT_OPTIONS,
} from './types';

// components
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

// getTileAttribution
// Description: Gets the correct Copyright attribution given a certain tileProvider URL.
export const getTileAttribution = (tileProvider: string) => {
  if (tileProvider?.includes('maptiler')) {
    return MAPTILER_DEFAULT_OPTIONS.attribution;
  }

  if (tileProvider?.includes('wien.gv.at/basemap')) {
    return BASEMAP_AT_DEFAULT_OPTIONS.attribution;
  }

  return DEFAULT_TILE_OPTIONS.attribution;
};

// getMapPinSymbol
// Description: Get a map pin symbol with a given color
export const getMapPinSymbol = (color?: string) => {
  return new SimpleMarkerSymbol({
    color,
    outline: {
      color: colors.white,
    },
    size: '38px',
    xoffset: 0,
    yoffset: 14,
    path: 'M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z',
  });
};
