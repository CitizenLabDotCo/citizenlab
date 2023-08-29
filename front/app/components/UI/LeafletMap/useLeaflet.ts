import { useEffect, useState, useRef, useCallback } from 'react';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
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
  initialSelectedPointId?: string;
  center?: L.LatLngTuple;
  zoom?: number;
  tileProvider?: string | null;
  tileOptions?: Record<string, unknown>;
  zoomControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  layersControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  geoJsonLayers?: GeoJSONLayer[];
  points?: Point[];
  noMarkerClustering?: boolean;
  layerMarker?: IMarkerStringOrObjectOrFunctionForLayer;
  layerOverlay?: IOverlayStringOrObjectOrFunctionForLayer;
  layerTooltip?: ITooltipStringOrObjectOrFunctionForLayer;
  layerPopup?: IPopupStringOrObjectOrFunctionForLayer;
  singleClickEnabled?: boolean;
  onInit?: (map: L.Map) => void;
}

// Marker icons
const markerIcon = service.getMarkerIcon({ url: DEFAULT_MARKER_ICON });
const markerHoverIcon = service.getMarkerIcon({
  url: DEFAULT_MARKER_HOVER_ICON,
});
const markerActiveIcon = service.getMarkerIcon({
  url: DEFAULT_MARKER_ACTIVE_ICON,
});

export default function useLeaflet(
  mapId: string,
  {
    initialSelectedPointId,
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
    singleClickEnabled = true,
    onInit,
  }: ILeafletMapConfig
) {
  // State
  const [map, setMap] = useState<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.Marker[] | null>(null);
  const [_tileLayer, setTileLayer] = useState<L.Layer | null>(null);
  const [_layers, setLayers] = useState<L.GeoJSON[] | null>(null);
  const [markerClusterGroup, setMarkerClusterGroup] =
    useState<L.MarkerClusterGroup | null>(null);
  const [_layersControl, setLayersControl] = useState<L.Control.Layers | null>(
    null
  );
  const [initialSelectedPointDone, setInitialSelectedPointDone] =
    useState(false);

  // Ref
  const selectedMarkerRef = useRef<string | null>(null);
  const hoveredMarkerRef = useRef<string | null>(null);

  const selectMarker = useCallback(
    (selectedMarkerId: string) => {
      const selectedMarker = markers?.find(
        (marker) => marker.options['id'] === selectedMarkerId
      );

      if (selectedMarker) {
        const isMarkerHiddenBehindCluster = !map?.hasLayer(selectedMarker);

        if (isMarkerHiddenBehindCluster) {
          markerClusterGroup?.zoomToShowLayer(selectedMarker);
        } else {
          const { lat, lng } = selectedMarker.getLatLng();
          setLeafletMapCenter([lat, lng]);
        }
      }

      const previouslySelectedMarker = selectedMarkerRef.current;

      markers?.forEach((marker) => {
        const markerId = marker.options['id'] as string;

        if (markerId === selectedMarkerId) {
          marker.setIcon(markerHoverIcon)?.setZIndexOffset(999);
        } else if (
          markerId === previouslySelectedMarker &&
          selectedMarkerId !== previouslySelectedMarker
        ) {
          marker.setIcon(markerIcon)?.setZIndexOffset(0);
        }
      });

      selectedMarkerRef.current = selectedMarkerId;
    },
    [map, markers, markerClusterGroup]
  );

  // Subscriptions
  useEffect(() => {
    if (initialSelectedPointDone) return;
    if (!initialSelectedPointId || !markers) return;
    selectMarker(initialSelectedPointId);
    setInitialSelectedPointDone(true);
  }, [initialSelectedPointDone, initialSelectedPointId, markers, selectMarker]);

  useEffect(() => {
    const selectSubscription =
      leafletMapSelectedMarker$.subscribe(selectMarker);

    const hoverSubscription = leafletMapHoveredMarker$.subscribe(
      (hoveredMarkerId) => {
        const previouslyHoveredMarker = hoveredMarkerRef.current;

        markers?.forEach((marker) => {
          const markerId = marker.options['id'] as string;

          if (markerId !== selectedMarkerRef.current) {
            if (markerId === hoveredMarkerId) {
              marker.setIcon(markerActiveIcon)?.setZIndexOffset(999);
            } else if (
              markerId === previouslyHoveredMarker &&
              hoveredMarkerId !== previouslyHoveredMarker
            ) {
              marker.setIcon(markerIcon)?.setZIndexOffset(0);
            }
          }
        });

        hoveredMarkerRef.current = hoveredMarkerId;
      }
    );

    return () => {
      selectSubscription.unsubscribe();
      hoverSubscription.unsubscribe();
    };
  }, [map, markers, selectMarker]);

  const mapEvents = () => {
    const subscriptions = [
      combineLatest([leafletMapCenter$, leafletMapZoom$])
        .pipe(
          distinctUntilChanged((x, y) => isEqual(x, y)),
          debounceTime(50)
        )
        .subscribe(([newCenter, newZoom]) => {
          service.changeView(map, newCenter, newZoom);
        }),
    ];

    if (map) {
      map.on('click', (event: L.LeafletMouseEvent) => {
        if (singleClickEnabled) {
          setLeafletMapClicked(event.latlng);
        }
      });
      map.on('moveend', (event: L.LeafletEvent) => {
        const newCenter = event.target.getCenter() as L.LatLng;
        const newCenterLat = newCenter.lat;
        const newCenterLng = newCenter.lng;
        setLeafletMapCenter([newCenterLat, newCenterLng]);
      });

      map.on('zoomend', (event: L.LeafletEvent) => {
        const newZoom = event.target.getZoom() as number;
        setLeafletMapZoom(newZoom);
      });
    }

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      map?.off('click');
    };
  };
  useEffect(mapEvents, [map, singleClickEnabled]);

  // Effects
  const setup = () => {
    if (!map) {
      const newMap = service.init(mapId, {
        center,
        zoom,
      });
      setMap(newMap);
      onInit?.(newMap);
    }
  };
  useEffect(setup, [
    map,
    mapId,
    tileProvider,
    tileOptions,
    zoom,
    center,
    onInit,
  ]);

  const refreshTile = () => {
    setTileLayer((prevTileLayer) => {
      service.removeLayer(map, prevTileLayer);
      return service.addTileLayer(map, tileProvider, tileOptions);
    });
  };
  useEffect(refreshTile, [map, tileProvider, tileOptions]);

  const centerStr = center ? JSON.stringify(center) : undefined;

  const refreshCenter = () => {
    if (!centerStr) return;
    const center: L.LatLngTuple = JSON.parse(centerStr);
    setLeafletMapCenter(center);
  };
  useEffect(refreshCenter, [map, centerStr]);

  const refreshZoom = () => {
    if (zoom !== undefined) {
      setLeafletMapZoom(zoom);
    }
  };
  useEffect(refreshZoom, [map, zoom]);

  const refreshZoomControlPosition = () => {
    if (map && zoomControlPosition) {
      map.zoomControl.setPosition(zoomControlPosition);
    }
  };
  useEffect(refreshZoomControlPosition, [map, zoomControlPosition]);

  const refreshLayers = () => {
    const layersControl =
      geoJsonLayers && geoJsonLayers?.length > 0
        ? service.addLayersControl(map, layersControlPosition)
        : null;

    setLayersControl((prevLayersControl) => {
      service.removeLayersControl(map, prevLayersControl);
      return layersControl;
    });

    setLayers((prevLayers) => {
      service.removeLayers(map, prevLayers);
      return service.addLayers(map, geoJsonLayers, {
        layersControl,
        overlay: layerOverlay,
        popup: layerPopup,
        tooltip: layerTooltip,
        marker: layerMarker,
      });
    });
  };
  useEffect(refreshLayers, [
    map,
    geoJsonLayers,
    layerOverlay,
    layerPopup,
    layerTooltip,
    layerMarker,
    layersControlPosition,
  ]);

  const refreshMarkers = () => {
    if (!map || !points) return;

    setMarkers((prevMarkers) => {
      service.removeLayers(map, prevMarkers);
      return service.addMarkersToMap(map, points, noMarkerClustering);
    });
  };
  useEffect(refreshMarkers, [map, points, noMarkerClustering]);

  const refreshClusterGroups = () => {
    if (!map || !markers) return;

    setMarkerClusterGroup((prevMarkerClusterGroup) => {
      service.removeLayer(map, prevMarkerClusterGroup);

      if (!noMarkerClustering) {
        return service.addMarkerClusterGroup(map, markers, {
          onClick: (id, _data) => {
            setLeafletMapSelectedMarker(id);
          },
        });
      }

      return null;
    });
  };
  useEffect(refreshClusterGroups, [map, markers, noMarkerClustering]);
  return map;
}
