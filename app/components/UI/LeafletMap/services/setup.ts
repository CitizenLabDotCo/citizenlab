import L from 'leaflet';

import {
  DEFAULT_TILE_PROVIDER,
  DEFAULT_TILE_OPTIONS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  DEFAULT_BOUND_CONFIG,
} from '../config';

import { IOnMapClickHandler } from '../typings';

export function setup(
  mapId,
  { tileProvider, onClick, center, zoom, onMoveHandler, onZoomHandler }
) {
  const map = init(mapId);

  addTileLayer(map, tileProvider);
  addOnClickHandler(map, onClick);
  changeView(map, center, zoom);
  addOnMoveHandler(map, onMoveHandler);
  addOnZoomHandler(map, onZoomHandler);

  return map;
}

export function init(mapId: string): L.Map {
  return L.map(mapId);
}

export function addTileLayer(
  map: L.Map,
  tileProvider: string = DEFAULT_TILE_PROVIDER
) {
  if (!map) {
    return;
  }

  L.tileLayer(tileProvider, DEFAULT_TILE_OPTIONS).addTo(map);
}

export function addOnClickHandler(
  map: L.Map,
  onClickHandler?: IOnMapClickHandler
): void {
  if (onClickHandler) {
    map.on('click', (event: L.LeafletMouseEvent) => {
      onClickHandler(map, event.latlng);
    });
  }
}

export function changeView(
  map: L.Map,
  center?: L.LatLngExpression,
  zoom?: number
): void {
  map.setView(
    (center || DEFAULT_CENTER) as L.LatLngExpression,
    zoom || DEFAULT_ZOOM
  );
}

export function addOnMoveHandler(
  map: L.Map,
  onMoveHandler: (latlng: [number, number]) => void
): void {
  map.on('moveend', () => {
    const center = map.getCenter();
    onMoveHandler([center.lat, center.lng]);
  });
}

export function addOnZoomHandler(
  map: L.Map,
  onZoomHandler: (latlng: number) => void
): void {
  map.on('zoomend', () => {
    const zoom = map.getZoom();
    onZoomHandler(zoom);
  });
}

export function refitBounds(
  map: L.Map,
  bounds: L.LatLngBounds,
  options: { fitBounds: boolean } = { fitBounds: true }
) {
  if (options.fitBounds) {
    map.fitBounds(bounds, DEFAULT_BOUND_CONFIG);
  }
}
