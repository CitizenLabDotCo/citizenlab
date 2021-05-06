import L from 'leaflet';
import 'leaflet-active-area';
import {
  DEFAULT_TILE_PROVIDER,
  DEFAULT_TILE_OPTIONS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
} from '../config';
import { setLeafletMapCenter, setLeafletMapZoom } from '../events';

export function init(
  mapId: string,
  {
    center,
    zoom,
    tileProvider,
    tileOptions,
  }: {
    center?: L.LatLngExpression;
    zoom?: number;
    tileProvider?: string | null;
    tileOptions?: object;
  }
) {
  const map = (L.map(mapId) as any).setActiveArea(
    'activeArea',
    true,
    true
  ) as L.Map;
  changeView(map, center, zoom);
  addTileLayer(map, tileProvider, tileOptions);
  return map;
}

export function addTileLayer(
  map: L.Map,
  tileProvider?: string | null,
  tileOptions?: object
) {
  return L.tileLayer(tileProvider || DEFAULT_TILE_PROVIDER, {
    ...DEFAULT_TILE_OPTIONS,
    ...tileOptions,
  }).addTo(map);
}

export function changeView(
  map?: L.Map | null,
  center?: L.LatLngExpression | null,
  zoom?: number | null
) {
  const newCenter = center || (DEFAULT_CENTER as L.LatLngExpression);
  const newZoom = zoom || DEFAULT_ZOOM;
  map?.setView(newCenter, newZoom);
  setLeafletMapCenter(newCenter);
  setLeafletMapZoom(newZoom);
}
