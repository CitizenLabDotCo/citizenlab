import L from 'leaflet';
import 'leaflet-active-area';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../config';

export function init(
  mapId: string,
  {
    center,
    zoom,
    tileProvider,
    tileOptions,
    zoomControlPosition,
  }: {
    center?: L.LatLngTuple;
    zoom?: number;
    tileProvider?: string | null;
    tileOptions?: object;
    zoomControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  }
) {
  const initCenter = center || DEFAULT_CENTER;
  const initZoom = zoom || DEFAULT_ZOOM;
  const map = ((L.map(mapId, {
    zoomControl: zoomControlPosition ? false : true,
  }) as any).setActiveArea('activeArea', true, true) as L.Map).setView(
    initCenter,
    initZoom
  );

  if (zoomControlPosition) {
    L.control
      .zoom({
        position: zoomControlPosition,
      })
      .addTo(map);
  }

  if (tileProvider && tileOptions !== undefined) {
    addTileLayer(map, tileProvider, tileOptions);
  }

  return map;
}

export function addTileLayer(
  map: L.Map,
  tileProvider: string,
  tileOptions: object
) {
  return L.tileLayer(tileProvider, tileOptions).addTo(map);
}

export function changeView(map: L.Map, center: L.LatLngTuple, zoom: number) {
  map.setView(center, zoom);
}
