import { isUndefinedOrError } from 'utils/helperUtils';
import { IOutput as IMapConfig } from '../hooks/useMapConfig';
import { IAppConfiguration } from 'services/appConfiguration';
import { IMapLayerAttributes } from '../services/mapLayers';
import { Locale } from 'typings';
import {
  getCenter as baseGetCenter,
  getZoomLevel as baseGetZoomLevel,
  getTileProvider as baseGetTileProvider,
} from 'utils/map';

export const getCenter = (
  centerCoordinates: GeoJSON.Position | undefined,
  appConfig: IAppConfiguration | undefined | null | Error,
  mapConfig: IMapConfig
) => {
  if (centerCoordinates) {
    return centerCoordinates as L.LatLngTuple;
  }

  const projectCenterLong =
    mapConfig?.attributes.center_geojson?.coordinates[0];
  const projectCenterLat = mapConfig?.attributes.center_geojson?.coordinates[1];

  if (
    isUndefinedOrError(projectCenterLong) ||
    isUndefinedOrError(projectCenterLat)
  ) {
    return baseGetCenter(centerCoordinates, appConfig);
  }

  const center: L.LatLngTuple = [projectCenterLat, projectCenterLong];

  return center;
};

export const getZoomLevel = (
  zoom: number | undefined,
  appConfig: IAppConfiguration | undefined | null | Error,
  mapConfig: IMapConfig
) => {
  if (zoom) {
    return zoom;
  }

  if (isUndefinedOrError(mapConfig?.attributes.zoom_level)) {
    return baseGetZoomLevel(zoom, appConfig);
  }

  const mapConfigZoomLevel = mapConfig?.attributes.zoom_level;

  return parseInt(mapConfigZoomLevel || '16', 10);
};

const DEFAULT_MAPS_TILE_PROVIDER =
  process.env.DEFAULT_MAPS_TILE_PROVIDER ||
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const getTileProvider = (
  appConfig: IAppConfiguration | undefined | null | Error,
  mapConfig: IMapConfig
): string => {
  if (isUndefinedOrError(mapConfig?.attributes?.tile_provider)) {
    return baseGetTileProvider(appConfig) || DEFAULT_MAPS_TILE_PROVIDER;
  }

  return mapConfig?.attributes?.tile_provider || DEFAULT_MAPS_TILE_PROVIDER;
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
