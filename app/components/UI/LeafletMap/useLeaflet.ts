import { useEffect, useState, useCallback, useMemo } from 'react';
import { isEmpty } from 'lodash-es';
import usePrevious from 'hooks/usePrevious';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import './simplestyle';
import marker from 'leaflet/dist/images/marker-icon.png';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import {
  broadcastMapCenter,
  broadcastMapZoom,
  setMapLatLngZoom$,
} from './events';

import service from './services';

import {
  Point,
  IMarkerStringOrObjectOrFunctionForLayer,
  IMarkerStringOrObjectOrFunctionForMap,
  IOverlayStringOrObjectOrFunctionForLayer,
  ITooltipStringOrObjectOrFunctionForLayer,
  IPopupStringOrObjectOrFunctionForLayer,
  IOnMapClickHandler,
  GeoJSONLayer,
} from './typings';

delete L.Icon.Default.prototype['_getIconUrl'];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: markerShadow,
});

export interface IUseLeafletOptions {
  center?: L.LatLngExpression;
  zoom?: number;
  tileProvider?: string;
  fitBounds?: boolean;
  onClick?: IOnMapClickHandler;
  onMarkerClick?: (id: string, data: string) => void;
  geoJsonLayers?: GeoJSONLayer[];
  points?: Point[];
  marker?: IMarkerStringOrObjectOrFunctionForMap;
  layerMarker?: IMarkerStringOrObjectOrFunctionForLayer;
  layerOverlay?: IOverlayStringOrObjectOrFunctionForLayer;
  layerTooltip?: ITooltipStringOrObjectOrFunctionForLayer;
  layerPopup?: IPopupStringOrObjectOrFunctionForLayer;
}

export default function useLeaflet(
  mapId: string,
  {
    center,
    zoom,
    tileProvider,
    fitBounds = true,
    onClick,
    onMarkerClick,
    geoJsonLayers,
    points,
    marker,
    layerMarker,
    layerOverlay,
    layerTooltip,
    layerPopup,
  }: IUseLeafletOptions
) {
  // State and memos
  const [map, setMap] = useState<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.Marker<any>[]>([]);
  const [layers, setLayers] = useState<L.GeoJSON[]>([]);

  const [
    markerClusterGroup,
    setMarkerClusterGroup,
  ] = useState<L.MarkerClusterGroup | null>(null);

  const [layerControl, setLayerControl] = useState<L.Control.Layers | null>(
    null
  );

  const allFeatures = useMemo(() => {
    const markersGroup = L.featureGroup(markers);

    let all = [...layers, markersGroup];

    markerClusterGroup && all.push(markerClusterGroup);

    return all;
  }, [markers, layers, markerClusterGroup]);

  const allBounds = useMemo(() => {
    return allFeatures.reduce(
      (memo, l) => memo.extend(l.getBounds()),
      L.latLngBounds([])
    );
  }, [points, layers, markerClusterGroup]);

  // Prevstate
  const prevMap = usePrevious(map);
  const prevMarkers = usePrevious(markers);
  const prevPoints = usePrevious(points);
  const prevCenter = usePrevious(center);
  const prevZoom = usePrevious(zoom);
  const prevGeoJsonLayers = usePrevious(geoJsonLayers);

  // Callbacks
  const addGeoJsonLayers = useCallback(
    (layerControl) => {
      if (!map || !geoJsonLayers) {
        return;
      }

      const options = {
        layerControl,
        overlay: layerOverlay,
        popup: layerPopup,
        tooltip: layerTooltip,
        marker: layerMarker,
      };

      const layers = service.addLayers(map, geoJsonLayers, options);

      setLayers(layers);
    },
    [
      map,
      geoJsonLayers,
      prevGeoJsonLayers,
      layerOverlay,
      layerPopup,
      layerTooltip,
      layerMarker,
    ]
  );

  // Effects

  // setup the map with
  useEffect(
    function setup() {
      if (map) {
        return;
      }
      const options = {
        tileProvider,
        onClick,
        zoom,
        center,
        onMoveHandler: broadcastMapCenter,
        onZoomHandler: broadcastMapZoom,
      };

      let newMap = service.setup(mapId, options);

      setMap(newMap);
    },
    [mapId, tileProvider, onClick, zoom]
  );

  useEffect(
    function refreshCenterAndZoom() {
      if (!map || (center !== prevCenter && zoom !== prevZoom)) {
        return;
      }

      service.changeView(map, center, zoom);
    },
    [map, center, prevCenter, zoom, prevZoom]
  );

  useEffect(
    function refreshLayers() {
      if (!map || prevGeoJsonLayers === geoJsonLayers) {
        return;
      }

      service.removeControl(map, layerControl);
      service.removeLayers(map, layers);

      const newLayerControl = service.addLayersControl(map);

      setLayerControl(newLayerControl);
      addGeoJsonLayers(newLayerControl);
    },
    [
      map,
      geoJsonLayers,
      prevGeoJsonLayers,
      layerControl,
      layers,
      addGeoJsonLayers,
    ]
  );

  useEffect(
    function refreshMarkers() {
      if (!map || (prevPoints === points && prevMap === map)) {
        return;
      }

      const options = { fitBounds };

      const newMarkers = service.addMarkersToMap(map, points, marker, options);

      setMarkers(newMarkers);
    },
    [fitBounds, map, prevMap, points, prevPoints, marker]
  );

  useEffect(
    function refreshClusterGroups() {
      if (!map || (prevMap === map && prevMarkers === markers)) {
        return;
      }

      if (markerClusterGroup) {
        service.removeLayer(map, markerClusterGroup);
      }

      const newMarkerClusterGroup = service.addClusterGroup(map, markers, {
        onClick: onMarkerClick,
      });

      setMarkerClusterGroup(newMarkerClusterGroup);
    },
    [markerClusterGroup, prevMap, map, prevMarkers, markers, onMarkerClick]
  );

  useEffect(
    function refitBoundsToAllContent() {
      if (!map || isEmpty(allBounds)) {
        return;
      }

      service.refitBounds(map, allBounds, { fitBounds });
    },
    [allBounds, map, fitBounds]
  );

  useEffect(
    function hookSubscriptions() {
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
      };
    },
    [map]
  );

  return map;
}
