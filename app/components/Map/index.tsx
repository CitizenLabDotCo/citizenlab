import React, { memo, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import {
  isEqual,
  compact,
  isUndefined,
  isEmpty,
  reverse,
  cloneDeep,
} from 'lodash-es';

// Map
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import './simplestyle';
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
import useMapConfig from 'hooks/useMapConfig';
import usePrevious from 'hooks/usePrevious';

// utils
import { getCenter, getZoomLevel, getTileProvider } from 'utils/map';

// events
import {
  broadcastMapCenter,
  broadcastMapZoom,
  setMapLatLngZoom$,
} from './events';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// styling
import styled, { css } from 'styled-components';
import { darken } from 'polished';
import { media, defaultOutline, defaultCardStyle } from 'utils/styleUtils';
import ideaMarkerIcon from './idea-marker.svg';
import legendMarkerIcon from './legend-marker.svg';

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
  ${defaultCardStyle};
  border: solid 1px #ccc;
`;

const MapWrapper = styled.div`
  flex: 1;
  display: flex;
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
  max-height: 550px;
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

const LeafletMapContainer = styled.div<{ mapHeight: string | undefined }>`
  flex: 1;
  overflow: hidden;

  ${(props) => {
    const { mapHeight } = props;

    if (mapHeight) {
      return css`
        height: ${mapHeight};
      `;
    }

    return css`
      height: calc(100vh - 300px);
      max-height: 700px;

      ${media.smallerThan1100px`
        height: calc(100vh - 180px);
      `}
    `;
  }}

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
  mapHeight?: string;
  boxContent?: JSX.Element | null;
  onBoxClose?: (event: React.FormEvent) => void;
  onMarkerClick?: (id: string, data: any) => void;
  onMapClick?: (map: L.Map, position: L.LatLng) => void;
  fitBounds?: boolean;
  hideLegend?: boolean;
  className?: string;
}

const Map = memo<Props & InjectedLocalized>(
  ({
    projectId,
    centerCoordinates,
    zoom,
    mapHeight,
    points,
    boxContent,
    onBoxClose,
    onMapClick,
    onMarkerClick,
    fitBounds,
    className,
    localize,
    hideLegend,
  }) => {
    const appConfig = useAppConfiguration();
    const mapConfig = useMapConfig({ projectId });

    const [map, setMap] = useState<L.Map | null>(null);
    const [layerControl, setLayerControl] = useState<L.Control.Layers | null>(
      null
    );
    const [layers, setLayers] = useState<L.Layer[]>([]);
    const [defaultCenter, setDefaultCenter] = useState(
      getCenter(centerCoordinates, appConfig, mapConfig)
    );
    const [markers, setMarkers] = useState<L.Marker<any>[]>([]);
    const [
      markerClusterGroup,
      setMarkerClusterGroup,
    ] = useState<L.MarkerClusterGroup | null>(null);

    const prevMapConfig = usePrevious(mapConfig);
    const prevMap = usePrevious(map);
    const prevMarkers = usePrevious(markers);
    const prevPoints = usePrevious(points);

    useEffect(() => {
      const subscriptions = [
        setMapLatLngZoom$.subscribe(({ lat, lng, zoom }) => {
          if (map) {
            map.setView([lat, lng], zoom);
          }
        }),
      ];

      return () => {
        subscriptions.forEach((subscription) => subscription.unsubscribe());
        map?.off('moveend');
        map?.off('zoomend');
        // broadcastMapCenter(null);
        // broadcastMapZoom(null);
      };
    }, [map]);

    // set default center
    useEffect(() => {
      const newDefaultCenter = getCenter(
        centerCoordinates,
        appConfig,
        mapConfig
      );
      setDefaultCenter((defaultCenter) =>
        !isEqual(defaultCenter, newDefaultCenter)
          ? newDefaultCenter
          : defaultCenter
      );
    }, [appConfig, mapConfig, centerCoordinates]);

    // init map
    useEffect(() => {
      if (!isNilOrError(appConfig) && !isUndefined(mapConfig) && !map) {
        const tileProvider = getTileProvider(appConfig, mapConfig);
        const defaultCenter = getCenter(
          centerCoordinates,
          appConfig,
          mapConfig
        );
        const defaultZoom = getZoomLevel(zoom, appConfig, mapConfig);
        const map = L.map('mapid');

        L.tileLayer(tileProvider, {
          tileSize: 512,
          zoomOffset: -1,
          minZoom: 1,
          maxZoom: 20,
          crossOrigin: true,
          subdomains: ['a', 'b', 'c'],
          attribution:
            '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
        }).addTo(map);

        // map click handler
        if (onMapClick) {
          map.on('click', (event: L.LeafletMouseEvent) => {
            onMapClick(map, event.latlng);
          });
        }

        map.setView(defaultCenter, defaultZoom);

        broadcastMapCenter(defaultCenter);
        broadcastMapZoom(defaultZoom);

        map.on('moveend', () => {
          const center = map.getCenter();
          broadcastMapCenter([center.lat, center.lng]);
        });

        map.on('zoomend', () => {
          const zoom = map.getZoom();
          broadcastMapZoom(zoom);
        });

        setMap(map);
      }
    }, [map, appConfig, mapConfig, centerCoordinates, zoom, onMapClick]);

    // set layers and layerControl
    useEffect(() => {
      if (map && (prevMapConfig !== mapConfig || prevMap !== map)) {
        let newLayers: L.Layer[] = [];
        let newLayerControl: L.Control.Layers | null = null;

        // first remove old layers and layerControl
        if (layerControl) {
          map.removeControl(layerControl);
        }

        if (layers && layers.length > 0) {
          layers.forEach((layer) => {
            map.removeLayer(layer);
          });
        }

        if (
          map &&
          mapConfig &&
          mapConfig?.attributes?.layers &&
          mapConfig.attributes.layers.length > 0
        ) {
          newLayerControl = L.control.layers().addTo(map);
          newLayers = reverse(cloneDeep(mapConfig?.attributes?.layers))
            ?.filter((layer) => !isEmpty(layer.geojson))
            .map(({ geojson, title_multiloc, marker_svg_url }) => {
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

              newLayerControl?.addOverlay(layer, localize(title_multiloc));

              return layer;
            });
        }

        setLayers(newLayers);
        setLayerControl(newLayerControl);
      }
    }, [prevMap, map, prevMapConfig, mapConfig, layerControl, layers]);

    // set markers
    useEffect(() => {
      if (map && (prevPoints !== points || prevMap !== map)) {
        const bounds: [number, number][] = [];
        const newMarkers = compact(points).map((point) => {
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

        if (
          bounds &&
          bounds.length > 0 &&
          fitBounds &&
          zoom === 15 &&
          defaultCenter[0] === 0 &&
          defaultCenter[1] === 0
        ) {
          map.fitBounds(bounds, { maxZoom: 17, padding: [50, 50] });
        }

        setMarkers(newMarkers);
      }
    }, [prevMap, map, prevPoints, points, fitBounds, zoom, defaultCenter]);

    // set markerClusterGroup
    useEffect(() => {
      if (map && (prevMap !== map || prevMarkers !== markers)) {
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
          newMarkerClusterGroup.on('click', (event) => {
            onMarkerClick(event.layer.options.id, event.layer.options.data);
          });
        }

        setMarkerClusterGroup(newMarkerClusterGroup);
      }
    }, [prevMap, map, prevMarkers, markers, markerClusterGroup, onMarkerClick]);

    const handleBoxOnClose = (event: React.FormEvent) => {
      event.preventDefault();
      onBoxClose?.(event);
    };

    return (
      <Container className={className || ''}>
        <MapWrapper>
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
            className="e2e-map"
            mapHeight={mapHeight}
          />
        </MapWrapper>
        {projectId && !hideLegend && <Legend projectId={projectId} />}
      </Container>
    );
  }
);

export default injectLocalize(Map);
