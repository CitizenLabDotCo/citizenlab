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
  const fallbackColor = '#000000';

  if (type === 'Point') {
    return markerColor || fillColor || fallbackColor;
  }

  return fillColor || fallbackColor;
};
