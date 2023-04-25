import { isNilOrError } from 'utils/helperUtils';
import { IAppConfigurationData } from 'api/app_configuration/types';
import {
  DEFAULT_TILE_PROVIDER,
  DEFAULT_TILE_OPTIONS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
} from 'components/UI/LeafletMap/config';
import { LatLngTuple } from 'leaflet';
import { isNil } from 'lodash-es';
import formatcoords from 'formatcoords';

export const getCenter = (
  centerLatLng?: LatLngTuple | null,
  appConfig?: IAppConfigurationData | null | Error
) => {
  const tenantCenterLat =
    !isNilOrError(appConfig) &&
    appConfig?.attributes?.settings?.maps?.map_center?.lat;
  const tenantCenterLong =
    !isNilOrError(appConfig) &&
    appConfig?.attributes?.settings?.maps?.map_center?.long;

  if (!isNilOrError(centerLatLng)) {
    return centerLatLng;
  } else if (
    tenantCenterLat !== undefined &&
    tenantCenterLat !== false &&
    tenantCenterLong !== undefined &&
    tenantCenterLong !== false
  ) {
    return [
      parseFloat(tenantCenterLat),
      parseFloat(tenantCenterLong),
    ] as LatLngTuple;
  }

  return DEFAULT_CENTER;
};

export const getZoomLevel = (
  zoom?: number,
  appConfig?: IAppConfigurationData | null | Error
) => {
  const tenantZoomLevel =
    !isNilOrError(appConfig) &&
    (appConfig?.attributes?.settings?.maps?.zoom_level as any);
  return parseInt(zoom || tenantZoomLevel || DEFAULT_ZOOM, 10);
};

export const getTileProvider = (
  appConfig?: IAppConfigurationData | null | Error
) => {
  const tileProvider =
    !isNilOrError(appConfig) &&
    (appConfig?.attributes?.settings?.maps?.tile_provider as string);
  return tileProvider || DEFAULT_TILE_PROVIDER;
};

export const getTileOptions = () => {
  return DEFAULT_TILE_OPTIONS;
};

export const convertLatLngToDMS = (lat: any, lng: any) => {
  if (!isNil(lat) && !isNil(lng)) {
    return formatcoords(parseFloat(lat), parseFloat(lng)).format();
  }

  return null;
};

export const getAddressOrFallbackDMS = (
  location_description: string | null,
  location_point_geojson: GeoJSON.Point | null
) => {
  const point = location_point_geojson;
  const lat = point?.coordinates?.[1] || null;
  const lng = point?.coordinates?.[0] || null;
  const address = location_description || convertLatLngToDMS(lat, lng) || null;
  return address;
};
