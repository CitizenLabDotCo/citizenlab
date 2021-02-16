import React, { memo, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEqual } from 'lodash-es';

// Map
import L from 'leaflet';
import 'leaflet-simplestyle';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import marker from 'leaflet/dist/images/marker-icon.png';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype['_getIconUrl'];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: markerShadow,
});

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useMapConfig, { IOutput as IMapConfig } from 'hooks/useMapConfig';
import usePrevious from 'hooks/usePrevious';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// styling
import styled from 'styled-components';

// typings
import { IAppConfiguration } from 'services/appConfiguration';

export interface Point extends GeoJSON.Point {
  data?: any;
  id: string;
  title?: string;
}

const Container = styled.div``;

interface Props {
  projectId: string;
  centerCoordinates?: GeoJSON.Position;
  points?: Point[];
  areas?: GeoJSON.Polygon[];
  zoom?: number;
  boxContent?: JSX.Element | null;
  onBoxClose?: (event: React.FormEvent) => void;
  onMarkerClick?: (id: string, data: any) => void;
  onMapClick?: (map: L.Map, position: L.LatLng) => void;
  fitBounds?: boolean;
  mapHeight?: number;
  className?: string;
}

const getCenter = (
  centerCoordinates: GeoJSON.Position | undefined,
  appConfig: IAppConfiguration | undefined | null | Error,
  mapConfig: IMapConfig
) => {
  const projectCenterLat =
    mapConfig?.attributes.center_geojson?.coordinates?.[0];
  const tenantCenterLat =
    !isNilOrError(appConfig) &&
    appConfig?.data?.attributes?.settings?.maps?.map_center?.lat;
  const projectCenterLong =
    mapConfig?.attributes.center_geojson?.coordinates?.[1];
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
    center = [projectCenterLong, projectCenterLat];
  } else if (
    tenantCenterLat !== undefined &&
    tenantCenterLat !== false &&
    tenantCenterLong !== undefined &&
    tenantCenterLong !== false
  ) {
    center = [tenantCenterLong, tenantCenterLat] as any;
  }

  return center;
};

const getZoomLevel = (
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

const getTileProvider = (
  appConfig: IAppConfiguration | undefined | null | Error,
  mapConfig: IMapConfig
) => {
  const mapConfigTileProvider = mapConfig?.attributes?.tile_provider;
  const appConfigProvider =
    !isNilOrError(appConfig) &&
    appConfig?.data?.attributes?.settings?.maps?.tile_provider;
  const fallbackProvider =
    'https://api.maptiler.com/maps/77632ac6-e168-429c-8b1b-76599ce796e3/{z}/{x}/{y}@2x.png?key=DIZiuhfkZEQ5EgsaTk6D';
  return mapConfigTileProvider || appConfigProvider || fallbackProvider;
};

const Map = memo<Props & InjectedLocalized>(
  ({ projectId, centerCoordinates, zoom, className, localize }) => {
    const appConfig = useAppConfiguration();
    const mapConfig = useMapConfig({ projectId, prefetchMapLayers: true });

    const [map, setMap] = useState<L.Map | null>(null);
    const [layerControl, setLayerControl] = useState<L.Control.Layers | null>(
      null
    );
    const [center, setCenter] = useState(
      getCenter(centerCoordinates, appConfig, mapConfig)
    );
    const [zoomLevel, setZoomLevel] = useState(
      getZoomLevel(zoom, appConfig, mapConfig)
    );

    // set center
    useEffect(() => {
      const nextCenter = getCenter(centerCoordinates, appConfig, mapConfig);
      setCenter((prevCenter) =>
        !isEqual(prevCenter, nextCenter) ? nextCenter : prevCenter
      );
      setZoomLevel(getZoomLevel(zoom, appConfig, mapConfig));
    }, [appConfig, mapConfig, centerCoordinates]);

    // set zoom
    useEffect(() => {
      setZoomLevel(getZoomLevel(zoom, appConfig, mapConfig));
    }, [appConfig, mapConfig, zoom]);

    // set map
    useEffect(() => {
      if (!isNilOrError(appConfig) && mapConfig && !map) {
        const tileProvider = getTileProvider(appConfig, mapConfig);
        const map = L.map('mapid');
        L.tileLayer(tileProvider, {
          tileSize: 512,
          zoomOffset: -1,
          minZoom: 1,
          maxZoom: 17,
          crossOrigin: true,
          attribution:
            '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
        }).addTo(map);
        setMap(map);
      }
    }, [map, appConfig, mapConfig, centerCoordinates, zoom]);

    // set layerControl
    useEffect(() => {
      if (map && !layerControl) {
        setLayerControl(L.control.layers().addTo(map));
      }
    }, [map, layerControl]);

    // apply zoom and cenetr changes on map
    useEffect(() => {
      map?.setView(center, zoomLevel);
    }, [map, center, zoomLevel]);

    // apply custom layer changes on map
    useEffect(() => {
      // first remove custom layers from layerControler and map
      map?.eachLayer((layer) => {
        layerControl?.removeLayer(layer);

        if (layer?.['isCustom']) {
          map.removeLayer(layer);
        }
      });

      // then (re)add layers to map and layerControl
      if (!isNilOrError(mapConfig) && map) {
        mapConfig?.attributes?.layers?.forEach(
          ({ geojson, title_multiloc }) => {
            if (geojson) {
              const layer = L.geoJSON(geojson, {
                useSimpleStyle: true,
                useMakiMarkers: true,
                onEachFeature: (feature, layer) => {
                  layer.isCustom = true;

                  if (
                    feature.properties &&
                    feature.properties.popupContent &&
                    Object.values(feature.properties.popupContent).some(
                      (x) => x && x !== ''
                    )
                  ) {
                    layer.bindPopup(localize(feature.properties.popupContent));
                  }

                  if (
                    feature.properties &&
                    feature.properties.tooltipContent &&
                    Object.values(feature.properties.tooltipContent).some(
                      (x) => x && x !== ''
                    )
                  ) {
                    layer.bindTooltip(
                      localize(feature.properties.tooltipContent)
                    );
                  }
                },
              } as any).addTo(map);

              layerControl?.addOverlay(layer, localize(title_multiloc));
            }
          }
        );
      }
    }, [map, layerControl, mapConfig]);

    return <Container id="mapid" className={className || ''} />;
  }
);

export default injectLocalize(Map);
