import Geometry from '@arcgis/core/geometry/Geometry';
import Point from '@arcgis/core/geometry/Point';
import * as projection from '@arcgis/core/geometry/projection.js';
import { isArray, isNumber } from 'lodash-es';
import { SupportedLocale } from 'typings';

import { IAppConfigurationData } from 'api/app_configuration/types';
import { IMapConfigData } from 'api/map_config/types';
import { IMapLayerAttributes } from 'api/map_layers/types';

import { isNilOrError } from 'utils/helperUtils';
import {
  getCenter as baseGetCenter,
  getZoomLevel as baseGetZoomLevel,
  getTileProvider as baseGetTileProvider,
} from 'utils/map';

export type LatLngTuple = [number, number, number?];

export const projectPointToWebMercator = (geometry: Geometry): Point => {
  const projectedPoint = projection.project(geometry, {
    wkid: 3857, // Web Mercator Projection
  });

  // Typing is a bit off with the ArcGIS Library,
  // but we can cast it to a Point when we return.

  if (isArray(projectedPoint)) {
    return projectedPoint[0] as Point;
  }

  return projectedPoint as Point;
};

export const getCenter = (
  centerLatLng: LatLngTuple | null | undefined,
  appConfig: IAppConfigurationData | undefined,
  mapConfig: IMapConfigData | undefined
) => {
  const mapConfigLat = !isNilOrError(mapConfig)
    ? // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      mapConfig?.attributes.center_geojson?.coordinates[1]
    : null;
  const mapConfigLng = !isNilOrError(mapConfig)
    ? // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      mapConfig?.attributes.center_geojson?.coordinates[0]
    : null;

  if (centerLatLng) {
    return centerLatLng as LatLngTuple;
  } else if (!isNilOrError(mapConfigLng) && !isNilOrError(mapConfigLat)) {
    return [mapConfigLat, mapConfigLng] as LatLngTuple;
  }

  return baseGetCenter(undefined, appConfig);
};

export const getZoomLevel = (
  zoom: number | undefined,
  appConfig: IAppConfigurationData | undefined | null | Error,
  mapConfig: IMapConfigData | undefined
) => {
  const mapConfigZoom = !isNilOrError(mapConfig)
    ? // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      mapConfig?.attributes.zoom_level
    : null;

  if (isNumber(zoom)) {
    return zoom;
  } else if (!isNilOrError(mapConfigZoom)) {
    return parseInt(mapConfigZoom, 10);
  }

  return baseGetZoomLevel(undefined, appConfig);
};

// Esri Zoom to Scale Mapping
// https://developers.arcgis.com/documentation/mapping-and-location-services/reference/zoom-levels-and-scale/
export const zoomToScale: { [zoom: number]: number } = {
  0: 591657527.591555,
  1: 295828763.795777,
  2: 147914381.897889,
  3: 73957190.948944,
  4: 36978595.474472,
  5: 18489297.737236,
  6: 9244648.868618,
  7: 4622324.434309,
  8: 2311162.217155,
  9: 1155581.108577,
  10: 577790.554289,
  11: 288895.277144,
  12: 144447.638572,
  13: 72223.819286,
  14: 36111.909643,
  15: 18055.954822,
  16: 9027.977411,
  17: 4513.988705,
  18: 2256.994353,
  19: 1128.497176,
  20: 564.248588,
  21: 282.124294,
  22: 141.062147,
  23: 70.5310735,
};

// getMapZoom
// Description: This function calculates the map zoom level based on the provided Esri mapZoom and mapScale values.
export function getMapZoom(mapZoom: number, scale: number): string {
  // If the mapView has a zoom already, use it directly
  if (mapZoom > 0) {
    return mapZoom.toString();
  }

  // Use reduce to iterate over each zoom level and find the one with the smallest difference to the input scale
  const closestZoom = Object.entries(zoomToScale).reduce(
    (currentClosestZoom, [zoomLevel, zoomScaleValue]) => {
      const currentZoomLevelDiff = Math.abs(zoomScaleValue - scale); // Difference between current scale value and input
      const closestZoomLevelDiff = Math.abs(
        zoomToScale[currentClosestZoom] - scale
      ); // Difference for the current best match

      // Return the zoom level that is closer to the target scale
      return currentZoomLevelDiff < closestZoomLevelDiff
        ? zoomLevel
        : currentClosestZoom;
    },
    0
  ); // Start assuming zoom level 0 is the closest

  // Return the closest zoom level
  return closestZoom.toString();
}

// calculateScaleFromZoom
// Description: Calculates the approximate map scale for a given zoom level using
// Esri's zoom-to-scale mapping.
export const calculateScaleFromZoom = (zoom: number): number => {
  return zoomToScale[zoom] || zoomToScale[18]; // Fall back to zoom level 18 if not found
};

export const getTileProvider = (
  appConfig: IAppConfigurationData | undefined | null | Error,
  mapConfig: IMapConfigData | undefined
) => {
  const mapConfigTileProvider = !isNilOrError(mapConfig)
    ? // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      mapConfig?.attributes.tile_provider
    : null;

  if (!isNilOrError(mapConfigTileProvider)) {
    return mapConfigTileProvider;
  }

  return baseGetTileProvider(appConfig);
};

export const getGeojsonLayerType = (
  mapLayer: IMapLayerAttributes | undefined
) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return mapLayer?.geojson?.features?.[0]?.geometry?.type || 'Point';
};

export const getLayerColor = (mapLayer: IMapLayerAttributes | undefined) => {
  const type = getGeojsonLayerType(mapLayer);
  const fillColor: string | undefined =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    mapLayer?.geojson?.features?.[0]?.properties?.fill;
  const markerColor: string | undefined =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    mapLayer?.geojson?.features?.[0]?.properties?.['marker-color'];
  const fallbackColor = '#7D7D7D';

  if (type === 'Point') {
    return markerColor || fillColor || fallbackColor;
  }

  return fillColor || fallbackColor;
};

export const getLayerIcon = (mapLayer: IMapLayerAttributes | undefined) => {
  const layerType = getGeojsonLayerType(mapLayer);
  let iconName: 'location-simple' | 'line' | 'rectangle' = 'rectangle';

  if (layerType === 'Point') {
    iconName = 'location-simple';
  } else if (layerType === 'LineString') {
    iconName = 'line';
  }

  return iconName;
};

export const getUnnamedLayerTitleMultiloc = (
  tenantLocales: SupportedLocale[]
) => {
  const newUnnamedLayerTitle = 'Unnamed layer';
  const title_multiloc = {};
  tenantLocales.forEach(
    (tenantLocale) => (title_multiloc[tenantLocale] = newUnnamedLayerTitle)
  );
  return title_multiloc;
};

export const makiIconNames = [
  'aerialway',
  'airfield',
  'airport',
  'alcohol-shop',
  'america-football',
  'amusement-park',
  'aquarium',
  'art-gallery',
  'attraction',
  'bakery',
  'bank',
  'bar',
  'baseball',
  'basketball',
  'beer',
  'bicycle',
  'bicycle-share',
  'building',
  'bus',
  'cafe',
  'campsite',
  'car',
  'cemetery',
  'cinema',
  'circle',
  'circle-stroked',
  'clothing-store',
  'college',
  'commercial',
  'cricket',
  'cross',
  'dam',
  'danger',
  'dentist',
  'doctor',
  'dog-park',
  'drinking-water',
  'embassy',
  'entrance',
  'fast-food',
  'ferry',
  'fire-station',
  'fuel',
  'garden',
  'gift',
  'golf',
  'grocery',
  'hairdresser',
  'harbor',
  'heart',
  'heliport',
  'hospital',
  'ice-cream',
  'industry',
  'information',
  'laundry',
  'library',
  'lighthouse',
  'lodging',
  'marker',
  'monument',
  'mountain',
  'museum',
  'music',
  'park',
  'parking',
  'parking-garage',
  'pharmacy',
  'picnic-site',
  'pitch',
  'place-of-worship',
  'playground',
  'police',
  'post',
  'prison',
  'rail',
  'rail-light',
  'rail-metro',
  'ranger-station',
  'religious-christian',
  'religious-jewish',
  'religious-muslim',
  'restaurant',
  'roadblock',
  'rocket',
  'school',
  'shelter',
  'shop',
  'skiing',
  'soccer',
  'square',
  'square-stroke',
  'stadium',
  'star',
  'star-stroke',
  'suitcase',
  'sushi',
  'swimming',
  'telephone',
  'tennis',
  'theatre',
  'toilets',
  'town-hall',
  'triangle',
  'triangle-stroked',
  'veterinary',
  'volcano',
  'warehouse',
  'waste-basket',
  'water',
  'wetland',
  'zoo',
];
