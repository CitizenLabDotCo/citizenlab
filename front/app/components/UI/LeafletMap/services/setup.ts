import L from 'leaflet';
import 'leaflet-active-area';
import {
  DEFAULT_TILE_PROVIDER,
  DEFAULT_TILE_OPTIONS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
} from '../config';

export function init(
  mapId: string,
  {
    tileProvider,
    tileOptions,
    zoomControlPosition,
  }: {
    tileProvider?: string | null;
    tileOptions?: object;
    zoomControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  }
) {
  const map = ((L.map(mapId, {
    zoomControl: zoomControlPosition ? false : true,
  }) as any).setActiveArea('activeArea', true, true) as L.Map).setView(
    [0, 0],
    16
  );

  if (zoomControlPosition) {
    L.control
      .zoom({
        position: zoomControlPosition,
      })
      .addTo(map);
  }

  addTileLayer(map, tileProvider, tileOptions);

  return map;
}

export function addTileLayer(
  map: L.Map,
  tileProvider?: string | null,
  tileOptions?: object
) {
  console.log({
    ...DEFAULT_TILE_OPTIONS,
    ...tileOptions,
  });
  return L.tileLayer(tileProvider || DEFAULT_TILE_PROVIDER, {
    ...DEFAULT_TILE_OPTIONS,
    ...tileOptions,
  }).addTo(map);
}

export function changeView(
  map: L.Map,
  center?: L.LatLngTuple | null,
  zoom?: number | null
) {
  const newCenter = center || (DEFAULT_CENTER as L.LatLngTuple);
  const newZoom = zoom || DEFAULT_ZOOM;
  map.setView(newCenter, newZoom);
}
