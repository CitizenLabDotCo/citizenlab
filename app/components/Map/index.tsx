import React, { memo, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEqual, compact } from 'lodash-es';

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

// components
import { Icon } from 'cl2-component-library';
import Legend from './Legend';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useMapConfig, { IOutput as IMapConfig } from 'hooks/useMapConfig';
import usePrevious from 'hooks/usePrevious';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// styling
import styled from 'styled-components';
import { darken } from 'polished';
import { media, defaultOutline } from 'utils/styleUtils';
import ideaMarkerIcon from './idea-marker.svg';
import legendMarkerIcon from './legend-marker.svg';

// typings
import { IAppConfiguration } from 'services/appConfiguration';

export interface Point extends GeoJSON.Point {
  data?: any;
  id: string;
  title?: string;
}

const ideaMarker = L.icon({
  iconUrl: ideaMarkerIcon,
  iconSize: [29, 41],
  iconAnchor: [14, 41],
});

const fallbackLegendMarker = L.icon({
  iconUrl: legendMarkerIcon,
  iconSize: [29, 41],
  iconAnchor: [14, 41],
});

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  flex-direction: column;
`;

const MapContainer = styled.div`
  position: relative;
`;

const BoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: absolute;
  top: 0;
  z-index: 1001;
  background: #fff;
  width: 100%;
  height: 80%;
`;

const CloseButton = styled.button`
  width: 28px;
  height: 28px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  border-radius: 50%;
  border: solid 1px transparent;
  background: #fff;
  transition: all 100ms ease-out;
  outline: none !important;

  &:hover {
    background: #ececec;
  }

  &.focus-visible {
    ${defaultOutline};
  }

  ${media.smallerThanMinTablet`
    top: 4px;
    right: 4px;
  `}
`;

const CloseIcon = styled(Icon)`
  width: 12px;
  height: 12px;
  fill: #000;
`;

const LeafletMapContainer = styled.div`
  flex: 1;
  overflow: hidden;

  .leaflet-container {
    height: 100%;
  }

  .marker-cluster-custom {
    background: #004949;
    border: 3px solid white;
    border-radius: 50%;
    color: white;
    height: 40px;
    line-height: 37px;
    text-align: center;
    width: 40px;

    &:hover {
      background: ${darken(0.2, '#004949')};
    }
  }
`;

interface Props {
  projectId?: string | null;
  centerCoordinates?: GeoJSON.Position;
  points?: Point[];
  areas?: GeoJSON.Polygon[];
  zoom?: number;
  boxContent?: JSX.Element | null;
  onBoxClose?: (event: React.FormEvent) => void;
  onMarkerClick?: (id: string, data: any) => void;
  onMapClick?: (map: L.Map, position: L.LatLng) => void;
  fitBounds?: boolean;
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
  ({
    projectId,
    centerCoordinates,
    zoom,
    points,
    boxContent,
    onBoxClose,
    onMapClick,
    onMarkerClick,
    fitBounds,
    className,
    localize,
  }) => {
    const appConfig = useAppConfiguration();
    const mapConfig = useMapConfig({ projectId, prefetchMapLayers: true });

    const [map, setMap] = useState<L.Map | null>(null);
    const prevMap = usePrevious(map);
    const [layerControl, setLayerControl] = useState<L.Control.Layers | null>(
      null
    );
    const [center, setCenter] = useState(
      getCenter(centerCoordinates, appConfig, mapConfig)
    );
    const [zoomLevel, setZoomLevel] = useState(
      getZoomLevel(zoom, appConfig, mapConfig)
    );
    const [markers, setMarkers] = useState<L.Marker<any>[]>([]);
    const prevMarkers = usePrevious(markers);
    const [
      markerClusterGroup,
      setMarkerClusterGroup,
    ] = useState<L.MarkerClusterGroup | null>(null);

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

        // handlers
        if (onMapClick) {
          map.on('click', handleMapClick);
        }

        setMap(map);
      }
    }, [map, appConfig, mapConfig, centerCoordinates, zoom, onMapClick]);

    // set layerControl
    useEffect(() => {
      if (map && !layerControl) {
        setLayerControl(L.control.layers().addTo(map));
      }
    }, [map, layerControl]);

    // apply zoom and center changes on map
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
          ({ geojson, title_multiloc, marker_svg_url }) => {
            if (geojson) {
              const layer = L.geoJSON(geojson, {
                useSimpleStyle: true,
                useMakiMarkers: true,
                pointToLayer: (_feature, latlng) => {
                  const customLegendMarker =
                    marker_svg_url && require(`${marker_svg_url}`);
                  return L.marker(latlng, {
                    icon: customLegendMarker || fallbackLegendMarker,
                  });
                },
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

    // apply points on map
    useEffect(() => {
      if (map) {
        const bounds: [number, number][] = [];
        const markers = compact(points).map((point) => {
          const latlng: [number, number] = [
            point.coordinates[1],
            point.coordinates[0],
          ];

          const markerOptions = {
            icon: ideaMarker,
            data: point.data,
            id: point.id,
            title: point.title ? point.title : '',
          };

          bounds.push(latlng);

          return L.marker(latlng, markerOptions);
        });

        setMarkers(markers);

        if (!prevMap && fitBounds && bounds?.length > 0) {
          map.fitBounds(bounds, { maxZoom: 12, padding: [50, 50] });
        }
      }
    }, [prevMap, map, points, fitBounds]);

    // apply clusters
    useEffect(() => {
      if (map && markers && (prevMap !== map || prevMarkers !== markers)) {
        if (markerClusterGroup) {
          map.removeLayer(markerClusterGroup);
        }

        const newMarkerClusterGroup = L.markerClusterGroup({
          showCoverageOnHover: false,
          spiderfyDistanceMultiplier: 2,
          iconCreateFunction: (cluster) => {
            return L.divIcon({
              html: `<span>${cluster.getChildCount()}</span>`,
              className: 'marker-cluster-custom',
              iconSize: L.point(40, 40, true),
            });
          },
        });
        newMarkerClusterGroup.addLayers(markers);
        map.addLayer(newMarkerClusterGroup);

        if (onMarkerClick) {
          newMarkerClusterGroup.on('click', handleMarkerClick);
        }

        setMarkerClusterGroup(newMarkerClusterGroup);
      }
    }, [prevMap, map, prevMarkers, markers, markerClusterGroup, onMarkerClick]);

    const handleMapClick = (event: L.LeafletMouseEvent) => {
      if (map) {
        onMapClick?.(map, event.latlng);
      }
    };

    const handleMarkerClick = (event) => {
      onMarkerClick?.(event.layer.options.id, event.layer.options.data);
    };

    const handleBoxOnClose = (event: React.FormEvent) => {
      event.preventDefault();
      onBoxClose?.(event);
    };

    return (
      <Container className={className || ''}>
        <MapContainer>
          {!isNilOrError(boxContent) && (
            <BoxContainer>
              <CloseButton onClick={handleBoxOnClose}>
                <CloseIcon name="close" />
              </CloseButton>

              {boxContent}
            </BoxContainer>
          )}

          <LeafletMapContainer
            id="mapid"
            className={`e2e-map ${className || ''}`}
          />
        </MapContainer>
        {projectId && <Legend projectId={projectId} />}
      </Container>
    );
  }
);

export default injectLocalize(Map);
