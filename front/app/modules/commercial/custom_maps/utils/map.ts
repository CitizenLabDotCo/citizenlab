import { isNilOrError } from 'utils/helperUtils';
import { IMapConfigState } from '../hooks/useMapConfig';
import { IAppConfiguration } from 'services/appConfiguration';
import { IMapLayerAttributes } from '../services/mapLayers';
import { Locale } from 'typings';
import { LatLngTuple } from 'leaflet';
import { isNumber } from 'lodash-es';
import {
  getCenter as baseGetCenter,
  getZoomLevel as baseGetZoomLevel,
  // getTileProvider as baseGetTileProvider,
  getTileOptions as baseGetTileOptions,
} from 'utils/map';
import {
  MAPTILER_DEFAULT_OPTIONS,
  BASEMAP_AT_DEFAULT_OPTIONS,
} from './tileProviderDefaultOptions';

export const getCenter = (
  centerLatLng: LatLngTuple | null | undefined,
  appConfig: IAppConfiguration | undefined | null | Error,
  mapConfig: IMapConfigState
) => {
  const mapConfigLat = !isNilOrError(mapConfig)
    ? mapConfig?.attributes.center_geojson?.coordinates[1]
    : null;
  const mapConfigLng = !isNilOrError(mapConfig)
    ? mapConfig?.attributes.center_geojson?.coordinates[0]
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
  appConfig: IAppConfiguration | undefined | null | Error,
  mapConfig: IMapConfigState
) => {
  const mapConfigZoom = !isNilOrError(mapConfig)
    ? mapConfig?.attributes.zoom_level
    : null;

  if (isNumber(zoom)) {
    return zoom;
  } else if (!isNilOrError(mapConfigZoom)) {
    return parseInt(mapConfigZoom, 10);
  }

  return baseGetZoomLevel(undefined, appConfig);
};

export const getTileProvider = (
  appConfig: IAppConfiguration | undefined | null | Error,
  mapConfig: IMapConfigState
) => {
  if (!appConfig) return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const mapConfigTileProvider = !isNilOrError(mapConfig)
    ? mapConfig?.attributes.tile_provider
    : null;

  if (!isNilOrError(mapConfigTileProvider)) {
    return mapConfigTileProvider;
  }

  // return baseGetTileProvider(appConfig);
  return 'https://{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png';
};

export const getTileOptions = (tileProvider: string) => {
  if (tileProvider?.includes('maptiler')) {
    return MAPTILER_DEFAULT_OPTIONS;
  }

  if (tileProvider?.includes('wien.gv.at/basemap')) {
    return BASEMAP_AT_DEFAULT_OPTIONS;
  }

  return baseGetTileOptions();
};

export const getLayerType = (mapLayer: IMapLayerAttributes | undefined) => {
  return mapLayer?.geojson?.features?.[0]?.geometry?.type || 'Point';
};

export const getLayerColor = (mapLayer: IMapLayerAttributes | undefined) => {
  const type = getLayerType(mapLayer);
  const fillColor: string | undefined =
    mapLayer?.geojson?.features?.[0]?.properties?.fill;
  const markerColor: string | undefined =
    mapLayer?.geojson?.features?.[0]?.properties?.['marker-color'];
  const fallbackColor = '#7D7D7D';

  if (type === 'Point') {
    return markerColor || fillColor || fallbackColor;
  }

  return fillColor || fallbackColor;
};

export const getLayerIcon = (mapLayer: IMapLayerAttributes | undefined) => {
  const layerType = getLayerType(mapLayer);
  let iconName: 'point' | 'line' | 'rectangle' = 'rectangle';

  if (layerType === 'Point') {
    iconName = 'point';
  } else if (layerType === 'LineString') {
    iconName = 'line';
  }

  return iconName;
};

export const getUnnamedLayerTitleMultiloc = (tenantLocales: Locale[]) => {
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
