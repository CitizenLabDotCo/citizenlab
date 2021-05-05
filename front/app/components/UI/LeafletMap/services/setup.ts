import L from 'leaflet';

import {
  DEFAULT_TILE_PROVIDER,
  DEFAULT_TILE_OPTIONS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
} from '../config';

import { IOnMapClickHandler } from '../typings';

export function setup(
  mapId,
  { onClick, center, zoom, onMoveHandler, onZoomHandler }
) {
  const map = init(mapId);

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
  tileProvider?: string | null,
  tileOptions?: object
): L.Layer | void {
  if (!map) {
    return;
  }

  return L.tileLayer(tileProvider || DEFAULT_TILE_PROVIDER, {
    ...DEFAULT_TILE_OPTIONS,
    ...tileOptions,
  }).addTo(map);
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
    center || (DEFAULT_CENTER as L.LatLngExpression),
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
