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
  }: {
    center?: L.LatLngTuple;
    zoom?: number;
    tileProvider?: string | null;
    tileOptions?: object;
  }
) {
  const initCenter = center || DEFAULT_CENTER;
  const initZoom = zoom || DEFAULT_ZOOM;
  const map = ((L.map(mapId, {
    zoomControl: true,
  }) as any).setActiveArea('activeArea', true, true) as L.Map).setView(
    initCenter,
    initZoom
  );

  if (tileProvider && tileOptions !== undefined) {
    addTileLayer(map, tileProvider, tileOptions);
  }

  return map;
}

export function addTileLayer(
  map: L.Map | null | undefined,
  tileProvider?: string | null,
  tileOptions?: object
) {
  if (map && tileProvider) {
    return L.tileLayer(tileProvider, tileOptions).addTo(map);
  }

  return null;
}

export function changeView(
  map: L.Map | null | undefined,
  center: L.LatLngTuple,
  zoom: number
) {
  map?.setView(center, zoom);
}
