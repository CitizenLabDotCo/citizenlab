import * as projection from '@arcgis/core/geometry/projection.js';
import { isNumber } from 'lodash-es';
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

export const projectPointToWebMercator = (geometry: __esri.Geometry) => {
  return projection.project([geometry], {
    wkid: 3857, // Web Mercator
  })[0];
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
