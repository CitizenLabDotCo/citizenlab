import {
  BASEMAP_AT_DEFAULT_OPTIONS,
  DEFAULT_TILE_OPTIONS,
  MAPTILER_DEFAULT_OPTIONS,
} from './types';

// Gets the correct Copyright attribution given a certain tileProcider URL.
export const getTileAttribution = (tileProvider: string) => {
  if (tileProvider?.includes('maptiler')) {
    return MAPTILER_DEFAULT_OPTIONS.attribution;
  }

  if (tileProvider?.includes('wien.gv.at/basemap')) {
    return BASEMAP_AT_DEFAULT_OPTIONS.attribution;
  }

  return DEFAULT_TILE_OPTIONS.attribution;
};
