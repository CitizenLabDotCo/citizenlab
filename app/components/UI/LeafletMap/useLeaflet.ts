import { useEffect, useState, useMemo } from 'react';
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

export interface ILeafletMapConfig {
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
    points,
    fitBounds = true,
    onClick,
    onMarkerClick,
    geoJsonLayers,
    marker,
    layerMarker,
    layerOverlay,
    layerTooltip,
    layerPopup,
  }: ILeafletMapConfig
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

    const all = [...layers, markersGroup];

    markerClusterGroup && all.push(markerClusterGroup);

    return all;
  }, [markers, layers, markerClusterGroup]);

  const allBounds = useMemo(() => {
    return allFeatures.reduce(
      (memo, l) => memo.extend(l.getBounds()),
      L.latLngBounds([])
    );
  }, [allFeatures]);

  // Prevstate
  const prevMap = usePrevious(map);
  const prevMarkers = usePrevious(markers);
  const prevPoints = usePrevious(points);
  const prevGeoJsonLayers = usePrevious(geoJsonLayers);

  // Effects
  const setup = () => {
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

    const newMap = service.setup(mapId, options);

    setMap(newMap);
  };
  useEffect(setup, [map, mapId, tileProvider, onClick, zoom, center]);

  const refreshCenterAndZoom = () => {
    if (map) {
      service.changeView(map, center, zoom);
    }
  };
  useEffect(refreshCenterAndZoom, [map, center, zoom]);

  const refreshLayers = () => {
    if (!map || prevGeoJsonLayers === geoJsonLayers) {
      return;
    }

    service.removeControl(map, layerControl);
    service.removeLayers(map, layers);

    const newLayerControl = service.addLayersControl(map);
    const newLayers = service.addLayers(map, geoJsonLayers, {
      layerControl: newLayerControl,
      overlay: layerOverlay,
      popup: layerPopup,
      tooltip: layerTooltip,
      marker: layerMarker,
    });

    setLayers(newLayers);
    setLayerControl(newLayerControl);
  };
  useEffect(refreshLayers, [
    map,
    prevGeoJsonLayers,
    geoJsonLayers,
    layerOverlay,
    layerPopup,
    layerTooltip,
    layerMarker,
    layerControl,
    layers,
  ]);

  const refreshMarkers = () => {
    if (!map || prevPoints === points) {
      return;
    }

    const options = { fitBounds };

    const newMarkers = service.addMarkersToMap(map, points, marker, options);

    setMarkers(newMarkers);
  };
  useEffect(refreshMarkers, [
    fitBounds,
    map,
    prevMap,
    points,
    prevPoints,
    marker,
  ]);

  const refreshClusterGroups = () => {
    if (!map || prevMarkers === markers) {
      return;
    }

    if (markerClusterGroup) {
      service.removeLayer(map, markerClusterGroup);
    }

    const newMarkerClusterGroup = service.addClusterGroup(map, markers, {
      onClick: onMarkerClick,
    });

    setMarkerClusterGroup(newMarkerClusterGroup);
  };
  useEffect(refreshClusterGroups, [
    markerClusterGroup,
    prevMap,
    map,
    prevMarkers,
    markers,
    onMarkerClick,
  ]);

  const refitBoundsToAllContent = () => {
    // Remove || true if you'd like to activate auto-fitting to all bounds.
    if (!map || isEmpty(allBounds) || !fitBounds || true) {
      return;
    }

    // service.refitBounds(map, allBounds, { fitBounds });
  };
  useEffect(refitBoundsToAllContent, [allBounds, map, fitBounds]);

  const wireUpSubscriptions = () => {
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
  };
  useEffect(wireUpSubscriptions, [map]);

  return map;
}
