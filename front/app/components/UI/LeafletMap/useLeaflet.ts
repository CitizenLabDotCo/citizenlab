import { useEffect, useState } from 'react';
import usePrevious from 'hooks/usePrevious';
import {
  distinctUntilChanged,
  debounceTime,
  startWith,
  pairwise,
} from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { isEqual } from 'lodash-es';
import {
  DEFAULT_MARKER_ICON,
  DEFAULT_MARKER_HOVER_ICON,
  DEFAULT_MARKER_ACTIVE_ICON,
} from './config';

// events
import {
  setLeafletMapSelectedMarker,
  setLeafletMapClicked,
  setLeafletMapCenter,
  setLeafletMapZoom,
  leafletMapHoveredMarker$,
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
  center?: L.LatLngTuple;
  zoom?: number;
  tileProvider?: string | null;
  tileOptions?: object;
  zoomControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  layersControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  geoJsonLayers?: GeoJSONLayer[];
  points?: Point[];
  noMarkerClustering?: boolean;
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
    zoomControlPosition,
    layersControlPosition,
    points,
    noMarkerClustering,
    geoJsonLayers,
    layerMarker,
    layerOverlay,
    layerTooltip,
    layerPopup,
  }: ILeafletMapConfig
) {
  // State and memos
  const [map, setMap] = useState<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.Marker[] | null>(null);
  const [tileLayer, setTileLayer] = useState<L.Layer | null>(null);
  const [layers, setLayers] = useState<L.GeoJSON[] | null>(null);
  const [
    markerClusterGroup,
    setMarkerClusterGroup,
  ] = useState<L.MarkerClusterGroup | null>(null);
  const [layersControl, setLayersControl] = useState<L.Control.Layers | null>(
    null
  );

  // Prevstate
  const prevMarkers = usePrevious(markers);
  const prevMarkerClusterGroup = usePrevious(markerClusterGroup);
  const prevLayers = usePrevious(layers);
  const prevLayersControl = usePrevious(layersControl);
  const prevTileLayer = usePrevious(tileLayer);

  // Marker icons
  const markerIcon = service.getMarkerIcon({ url: DEFAULT_MARKER_ICON });
  const markerHoverIcon = service.getMarkerIcon({
    url: DEFAULT_MARKER_HOVER_ICON,
  });
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
        zoomControlPosition,
      });
      setMap(newMap);
    }
  };
  useEffect(setup, [
    map,
    mapId,
    tileProvider,
    tileOptions,
    zoomControlPosition,
    zoom,
    center,
  ]);

  const refreshTile = () => {
    if (tileLayer !== prevTileLayer) {
      return;
    }

    if (map) {
      service.removeLayer(map, tileLayer);
      const newTileLayer = service.addTileLayer(map, tileProvider, tileOptions);
      setTileLayer(newTileLayer);
    }
  };
  useEffect(refreshTile, [
    map,
    tileProvider,
    tileOptions,
    tileLayer,
    prevTileLayer,
  ]);

  const refreshCenter = () => {
    if (center !== undefined) {
      setLeafletMapCenter(center);
    }
  };
  useEffect(refreshCenter, [map, center]);

  const refreshZoom = () => {
    if (zoom !== undefined) {
      setLeafletMapZoom(zoom);
    }
  };
  useEffect(refreshZoom, [map, zoom]);

  const refreshLayers = () => {
    if (layersControl !== prevLayersControl && layers !== prevLayers) {
      return;
    }

    if (map) {
      service.removeLayersControl(map, layersControl);
      service.removeLayers(map, layers);

      const newLayersControl = service.addLayersControl(
        map,
        layersControlPosition
      );
      const newLayers = service.addLayers(map, geoJsonLayers, {
        layersControl: newLayersControl,
        overlay: layerOverlay,
        popup: layerPopup,
        tooltip: layerTooltip,
        marker: layerMarker,
      });
      setLayers(newLayers);
      setLayersControl(newLayersControl);
    }
  };
  useEffect(refreshLayers, [
    map,
    geoJsonLayers,
    layerOverlay,
    layerPopup,
    layerTooltip,
    layerMarker,
    layersControl,
    prevLayersControl,
    layersControlPosition,
    layers,
    prevLayers,
  ]);

  const refreshMarkers = () => {
    if (markers !== prevMarkers) {
      return;
    }

    if (map) {
      service.removeLayers(map, markers);

      const newMarkers = service.addMarkersToMap(
        map,
        points,
        noMarkerClustering
      );

      setMarkers(newMarkers);
    }
  };
  useEffect(refreshMarkers, [
    map,
    points,
    markers,
    prevMarkers,
    noMarkerClustering,
  ]);

  const refreshClusterGroups = () => {
    if (markerClusterGroup !== prevMarkerClusterGroup) {
      return;
    }

    if (map) {
      service.removeLayer(map, markerClusterGroup);

      let newMarkerClusterGroup: L.MarkerClusterGroup | null = null;

      if (!noMarkerClustering) {
        newMarkerClusterGroup = service.addClusterGroup(map, markers, {
          onClick: (id, _data) => {
            setLeafletMapSelectedMarker(id);
          },
        });
      }

      setMarkerClusterGroup(newMarkerClusterGroup);
    }
  };
  useEffect(refreshClusterGroups, [
    markerClusterGroup,
    prevMarkerClusterGroup,
    map,
    markers,
    noMarkerClustering,
  ]);

  const markerEvents = () => {
    const subscriptions = [
      combineLatest(
        leafletMapHoveredMarker$.pipe(startWith(null, null), pairwise()),
        leafletMapSelectedMarker$.pipe(startWith(null, null), pairwise())
      ).subscribe(
        ([
          [prevHoveredMarker, hoveredMarker],
          [prevSelectedMarker, selectedMarker],
        ]) => {
          markers?.forEach((marker) => {
            const markerId = marker.options['id'];

            if (markerId === selectedMarker) {
              marker.setIcon(markerActiveIcon)?.setZIndexOffset(999);
            } else if (
              markerId === hoveredMarker &&
              hoveredMarker !== selectedMarker
            ) {
              marker.setIcon(markerHoverIcon)?.setZIndexOffset(999);
            } else if (
              markerId === prevHoveredMarker ||
              markerId === prevSelectedMarker
            ) {
              marker.setIcon(markerIcon)?.setZIndexOffset(0);
            }
          });
        }
      ),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  };
  useEffect(markerEvents, [markers]);

  const mapEvents = () => {
    const subscriptions = [
      combineLatest(leafletMapCenter$, leafletMapZoom$)
        .pipe(
          distinctUntilChanged((x, y) => isEqual(x, y)),
          debounceTime(50)
        )
        .subscribe(([newCenter, newZoom]) => {
          if (map !== null && newCenter !== null && newZoom !== null) {
            service.changeView(map, newCenter, newZoom);
          }
        }),
    ];

    map?.on('click', (event: L.LeafletMouseEvent) => {
      setLeafletMapClicked(map, event.latlng);
    });

    map?.on('moveend', (event: L.LeafletEvent) => {
      const newCenter = event.target.getCenter() as L.LatLng;
      const newCenterLat = newCenter.lat;
      const newCenterLng = newCenter.lng;
      setLeafletMapCenter([newCenterLat, newCenterLng]);
    });

    map?.on('zoomend', (event: L.LeafletEvent) => {
      const newZoom = event.target.getZoom() as number;
      setLeafletMapZoom(newZoom);
    });

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      map?.off('click');
      map?.off('moveend');
      map?.off('zoomend');
    };
  };
  useEffect(mapEvents, [map]);

  return map;
}
