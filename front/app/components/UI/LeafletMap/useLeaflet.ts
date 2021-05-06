import { useEffect, useState, useMemo } from 'react';
import usePrevious from 'hooks/usePrevious';
import { combineLatest } from 'rxjs';
import {
  DEFAULT_MARKER_ICON,
  // DEFAULT_MARKER_HOVER_ICON,
  DEFAULT_MARKER_ACTIVE_ICON,
} from './config';

// events
import {
  setLeafletMapSelectedMarker,
  setLeafletMapClicked,
  leafletMapSelectedMarker$,
  leafletMapCenter$,
  leafletMapZoom$,
} from './events';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import './simplestyle';
import marker from 'leaflet/dist/images/marker-icon.png';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { setLeafletMapCenter, setLeafletMapZoom } from './events';

import service from './services';

import {
  Point,
  IMarkerStringOrObjectOrFunctionForLayer,
  IOverlayStringOrObjectOrFunctionForLayer,
  ITooltipStringOrObjectOrFunctionForLayer,
  IPopupStringOrObjectOrFunctionForLayer,
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
  tileProvider?: string | null;
  tileOptions?: object;
  geoJsonLayers?: GeoJSONLayer[];
  points?: Point[];
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
    tileOptions,
    points,
    geoJsonLayers,
    layerMarker,
    layerOverlay,
    layerTooltip,
    layerPopup,
  }: ILeafletMapConfig
) {
  // State and memos
  const [map, setMap] = useState<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.Marker<any>[]>([]);
  const [tileLayer, setTileLayer] = useState<L.Layer | null>(null);
  const [layers, setLayers] = useState<L.GeoJSON[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const [
    markerClusterGroup,
    setMarkerClusterGroup,
  ] = useState<L.MarkerClusterGroup | null>(null);

  const [layersControl, setLayersControl] = useState<L.Control.Layers | null>(
    null
  );

  const tileConfig = useMemo(
    () => ({
      tileProvider,
      ...tileOptions,
    }),
    [tileProvider, tileOptions]
  );

  // Prevstate
  const prevMarkers = usePrevious(markers);
  const prevTileConfig = usePrevious(tileConfig);
  const prevPoints = usePrevious(points);
  const prevGeoJsonLayers = usePrevious(geoJsonLayers);
  const prevSelectedMarkerId = usePrevious(selectedMarkerId);

  // Marker icons
  const markerIcon = service.getMarkerIcon({ url: DEFAULT_MARKER_ICON });
  // const markerHoverIcon = service.getMarkerIcon({
  //   url: DEFAULT_MARKER_HOVER_ICON,
  // });
  const markerActiveIcon = service.getMarkerIcon({
    url: DEFAULT_MARKER_ACTIVE_ICON,
  });

  // Effects
  const setup = () => {
    if (!map) {
      const newMap = service.init(mapId, {
        center,
        zoom,
        tileProvider,
        tileOptions,
      });
      setMap(newMap);
    }
  };
  useEffect(setup, [map, mapId, tileProvider, tileOptions, zoom, center]);

  const refreshTile = () => {
    if (!map || (tileLayer && tileConfig === prevTileConfig)) {
      return;
    }

    if (tileLayer) {
      service.removeLayer(map, tileLayer);
    }

    const newTileLayer = service.addTileLayer(map, tileProvider, tileOptions);

    if (newTileLayer) {
      setTileLayer(newTileLayer);
    }
  };
  useEffect(refreshTile, [
    map,
    tileProvider,
    tileOptions,
    tileLayer,
    tileConfig,
    prevTileConfig,
  ]);

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

    service.removeLayersControl(map, layersControl);
    service.removeLayers(map, layers);

    const newLayersControl = service.addLayersControl(map);
    const newLayers = service.addLayers(map, geoJsonLayers, {
      layersControl: newLayersControl,
      overlay: layerOverlay,
      popup: layerPopup,
      tooltip: layerTooltip,
      marker: layerMarker,
    });

    setLayers(newLayers);
    setLayersControl(newLayersControl);
  };
  useEffect(refreshLayers, [
    map,
    prevGeoJsonLayers,
    geoJsonLayers,
    layerOverlay,
    layerPopup,
    layerTooltip,
    layerMarker,
    layersControl,
    layers,
  ]);

  const refreshMarkers = () => {
    if (map && prevPoints !== points) {
      const newMarkers = service.addMarkersToMap(map, points);
      setMarkers(newMarkers);
    }
  };
  useEffect(refreshMarkers, [map, points, prevPoints]);

  const markerSelectionChange = () => {
    if (prevSelectedMarkerId !== selectedMarkerId) {
      const prevSelectedMarker = markers.find(
        (marker) => marker.options['id'] === prevSelectedMarkerId
      );
      const newSelectedMarker = markers.find(
        (marker) => marker.options['id'] === selectedMarkerId
      );
      prevSelectedMarker?.setIcon(markerIcon);
      newSelectedMarker?.setIcon(markerActiveIcon);
    }
  };
  useEffect(markerSelectionChange, [
    prevSelectedMarkerId,
    selectedMarkerId,
    markers,
  ]);

  const refreshClusterGroups = () => {
    if (map && prevMarkers !== markers) {
      if (markerClusterGroup) {
        service.removeLayer(map, markerClusterGroup);
      }

      const newMarkerClusterGroup = service.addClusterGroup(map, markers, {
        onClick: (id, _data) => {
          setLeafletMapSelectedMarker(id);
        },
      });

      setMarkerClusterGroup(newMarkerClusterGroup);
    }
  };
  useEffect(refreshClusterGroups, [
    markerClusterGroup,
    map,
    prevMarkers,
    markers,
  ]);

  const wireUpSubscriptions = () => {
    const subscriptions = [
      leafletMapSelectedMarker$.subscribe((selectedIdeaId) => {
        setSelectedMarkerId(selectedIdeaId);
      }),
      combineLatest(leafletMapCenter$, leafletMapZoom$).subscribe(
        ([center, zoom]) => {
          service.changeView(map, center, zoom);
        }
      ),
    ];

    map?.on('click', (event: L.LeafletMouseEvent) => {
      setLeafletMapClicked(map, event.latlng);
    });

    map?.on('moveend', () => {
      const center = map.getCenter();
      setLeafletMapCenter(center);
    });

    map?.on('zoomend', () => {
      const zoom = map.getZoom();
      setLeafletMapZoom(zoom);
    });

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      map?.off('click');
      map?.off('moveend');
      map?.off('zoomend');
    };
  };
  useEffect(wireUpSubscriptions, [map]);

  return map;
}
