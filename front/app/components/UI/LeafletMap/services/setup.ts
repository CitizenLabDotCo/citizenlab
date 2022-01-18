import L from 'leaflet';
import 'leaflet-active-area';
import { isNil } from 'lodash-es';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../config';

export function init(
  mapId: string,
  {
    center,
    zoom,
  }: {
    center?: L.LatLngTuple;
    zoom?: number;
  }
) {
  const initCenter = center || DEFAULT_CENTER;
  const initZoom = zoom || DEFAULT_ZOOM;
  const map = (
    (
      L.map(mapId, {
        zoomControl: true,
      }) as any
    ).setActiveArea('activeArea', true, true) as L.Map
  ).setView(initCenter, initZoom);

  return map;
}

export function addTileLayer(
  map: L.Map | null | undefined,
  tileProvider?: string | null,
  tileOptions?: Record<string, unknown>
) {
  if (map && tileProvider) {
    return L.tileLayer(tileProvider, tileOptions).addTo(map);
  }

  return null;
}

export function changeView(
  map: L.Map | null | undefined,
  center: L.LatLngTuple | null | undefined,
  zoom: number | null | undefined
) {
  if (!isNil(map) && !isNil(center) && !isNil(zoom)) {
    map.setView(center, zoom);
  }
}
