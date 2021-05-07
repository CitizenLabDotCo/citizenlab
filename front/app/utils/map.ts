import { isNilOrError } from 'utils/helperUtils';
import { IAppConfiguration } from 'services/appConfiguration';

export const getCenter = (
  centerCoordinates: GeoJSON.Position | undefined,
  appConfig: IAppConfiguration | undefined | null | Error
) => {
  const tenantCenterLat =
    !isNilOrError(appConfig) &&
    appConfig?.data?.attributes?.settings?.maps?.map_center?.lat;
  const tenantCenterLong =
    !isNilOrError(appConfig) &&
    appConfig?.data?.attributes?.settings?.maps?.map_center?.long;

  let center: L.LatLngTuple = [0, 0];

  if (centerCoordinates !== undefined) {
    center = centerCoordinates as L.LatLngTuple;
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
  appConfig: IAppConfiguration | undefined | null | Error
) => {
  const tenantZoomLevel =
    !isNilOrError(appConfig) &&
    (appConfig?.data?.attributes?.settings?.maps?.zoom_level as any);
  return parseInt(zoom || tenantZoomLevel || 16, 10);
};

export const getTileProvider = (
  appConfig: IAppConfiguration | undefined | null | Error
) => {
  const tileProvider =
    !isNilOrError(appConfig) &&
    (appConfig?.data?.attributes?.settings?.maps?.tile_provider as string);
  return tileProvider || null;
};
