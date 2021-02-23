import { isNilOrError } from 'utils/helperUtils';
import { IOutput as IMapConfig } from 'hooks/useMapConfig';
import { IAppConfiguration } from 'services/appConfiguration';
import { IMapLayerAttributes } from 'services/mapLayers';

export const getCenter = (
  centerCoordinates: GeoJSON.Position | undefined,
  appConfig: IAppConfiguration | undefined | null | Error,
  mapConfig: IMapConfig
) => {
  const projectCenterLat =
    mapConfig?.attributes.center_geojson?.coordinates?.[1];
  const tenantCenterLat =
    !isNilOrError(appConfig) &&
    appConfig?.data?.attributes?.settings?.maps?.map_center?.lat;
  const projectCenterLong =
    mapConfig?.attributes.center_geojson?.coordinates?.[0];
  const tenantCenterLong =
    !isNilOrError(appConfig) &&
    appConfig?.data?.attributes?.settings?.maps?.map_center?.long;

  let center: L.LatLngExpression = [0, 0];

  if (centerCoordinates !== undefined) {
    center = centerCoordinates as L.LatLngExpression;
  } else if (
    projectCenterLat !== undefined &&
    projectCenterLong !== undefined
  ) {
    center = [projectCenterLat, projectCenterLong];
  } else if (
    tenantCenterLat !== undefined &&
    tenantCenterLat !== false &&
    tenantCenterLong !== undefined &&
    tenantCenterLong !== false
  ) {
    center = [parseFloat(tenantCenterLat), parseFloat(tenantCenterLong)];
  }

  return center;
};

export const getZoomLevel = (
  zoom: number | undefined,
  appConfig: IAppConfiguration | undefined | null | Error,
  mapConfig: IMapConfig
) => {
  const mapConfigZoomLevel = mapConfig?.attributes.zoom_level;
  const tenantZoomLevel =
    !isNilOrError(appConfig) &&
    (appConfig?.data?.attributes?.settings?.maps?.zoom_level as any);
  return parseInt(zoom || mapConfigZoomLevel || tenantZoomLevel || 16, 10);
};

export const getTileProvider = (
  _appConfig: IAppConfiguration | undefined | null | Error,
  mapConfig: IMapConfig
) => {
  const mapConfigTileProvider = mapConfig?.attributes?.tile_provider;
  const fallbackProvider =
    'https://api.maptiler.com/maps/77632ac6-e168-429c-8b1b-76599ce796e3/{z}/{x}/{y}@2x.png?key=DIZiuhfkZEQ5EgsaTk6D';
  return mapConfigTileProvider || fallbackProvider;
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
