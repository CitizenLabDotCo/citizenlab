import {
  distinctUntilChanged,
  map,
  publishReplay,
  refCount,
} from 'rxjs/operators';
import eventEmitter from 'utils/eventEmitter';
import L from 'leaflet';

enum events {
  mapCenterChange = 'mapCenterChange',
  mapZoomChange = 'mapZoomChange',
  setMapLatLngZoom = 'setMapLatLngZoom',
}

// ----------------------------------------------------------------------------------------------

export function broadcastMapCenter(center: L.LatLngExpression | null) {
  eventEmitter.emit<L.LatLngExpression | null>(events.mapCenterChange, center);
}

export const mapCenter$ = eventEmitter
  .observeEvent<L.LatLngExpression | null>(events.mapCenterChange)
  .pipe(
    map(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => x === y),
    publishReplay(1),
    refCount()
  );

// ----------------------------------------------------------------------------------------------

export function broadcastMapZoom(zoom: number | null) {
  eventEmitter.emit<number | null>(events.mapZoomChange, zoom);
}

export const mapZoom$ = eventEmitter
  .observeEvent<number | null>(events.mapZoomChange)
  .pipe(
    map(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => x === y),
    publishReplay(1),
    refCount()
  );

// ----------------------------------------------------------------------------------------------

export interface IMapLatLngZoom {
  lat: number;
  lng: number;
  zoom: number;
}

export function setMapLatLngZoom(mapLatLngZoom: IMapLatLngZoom) {
  eventEmitter.emit<IMapLatLngZoom>(events.setMapLatLngZoom, mapLatLngZoom);
}

export const setMapLatLngZoom$ = eventEmitter
  .observeEvent<IMapLatLngZoom>(events.setMapLatLngZoom)
  .pipe(map(({ eventValue }) => eventValue));

// ----------------------------------------------------------------------------------------------
