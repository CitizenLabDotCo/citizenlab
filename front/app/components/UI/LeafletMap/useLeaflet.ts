import { useEffect, useState, useMemo } from 'react';
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

import defaultMarker from './default-marker.svg';
// import defaultHoverMarker from './default-marker-hover.svg';
import defaultActiveMarker from './default-marker-active.svg';

export interface ILeafletMapConfig {
  center?: L.LatLngExpression;
  zoom?: number;
  tileProvider?: string | null;
  tileOptions?: object;
  onClick?: IOnMapClickHandler;
  onMarkerClick?: (id: string, data: string) => void;
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
    onClick,
    onMarkerClick,
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
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [tileLayer, setTileLayer] = useState<L.Layer | null>(null);
  const [layers, setLayers] = useState<L.GeoJSON[]>([]);

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
  const prevSelectedIdeaId = usePrevious(selectedIdeaId);

  // Marker icons
  const markerIcon = service.getMarkerIcon({ url: defaultMarker });
  // const markerHoverIcon = service.getMarkerIcon({
  //   url: defaultHoverMarker,
  // });
  const markerActiveIcon = service.getMarkerIcon({
    url: defaultActiveMarker,
  });

  // Effects
  const setup = () => {
    if (map) {
      return;
    }

    const options = {
      tileProvider,
      tileOptions,
      onClick,
      zoom,
      center,
      onMoveHandler: broadcastMapCenter,
      onZoomHandler: broadcastMapZoom,
    };

    const newMap = service.setup(mapId, options);
    service.addTileLayer(newMap, tileProvider, tileOptions);

    setMap(newMap);
  };
  useEffect(setup, [
    map,
    mapId,
    tileProvider,
    tileOptions,
    onClick,
    zoom,
    center,
  ]);

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
    if (!map || prevPoints === points) {
      return;
    }

    if (map && prevPoints !== points) {
      const newMarkers = service.addMarkersToMap(map, points);

      // newMarkers.forEach((marker) => {
      //   marker.on('click', () => {
      //     console.log('marker id', marker.options.id);
      //     newMarkers.forEach((newMarker) => {
      //       if (newMarker.options.id === marker.options.id) {
      //         newMarker.setIcon(markerActiveIcon);
      //       } else {
      //         newMarker.setIcon(markerIcon);
      //       }
      //     });
      //   });
      // });

      // newMarkers.forEach((marker) => {
      //   marker.on('mouseover', () => {
      //     if (marker.options['id'] !== selectedIdeaId)
      //   });
      // });

      setMarkers(newMarkers);
    }
  };
  useEffect(refreshMarkers, [map, points, prevPoints]);

  useEffect(() => {
    if (prevSelectedIdeaId === selectedIdeaId) {
      return;
    }

    const prevSelectedMarker = markers.find(
      (marker) => marker.options['id'] === prevSelectedIdeaId
    );
    const newSelectedMarker = markers.find(
      (marker) => marker.options['id'] === selectedIdeaId
    );
    prevSelectedMarker?.setIcon(markerIcon);
    newSelectedMarker?.setIcon(markerActiveIcon);
  }, [prevSelectedIdeaId, selectedIdeaId, markers]);

  const refreshClusterGroups = () => {
    if (!map || prevMarkers === markers) {
      return;
    }

    if (markerClusterGroup) {
      service.removeLayer(map, markerClusterGroup);
    }

    const newMarkerClusterGroup = service.addClusterGroup(map, markers, {
      onClick: (id, _data) => {
        setSelectedIdeaId(id);
        return onMarkerClick;
      },
    });

    setMarkerClusterGroup(newMarkerClusterGroup);
  };
  useEffect(refreshClusterGroups, [
    markerClusterGroup,
    map,
    prevMarkers,
    markers,
    onMarkerClick,
  ]);

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
