import { distinctUntilChanged, map as RxMap } from 'rxjs/operators';
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
    RxMap(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => x === y)
  );

// ----------------------------------------------------------------------------------------------

export function broadcastMapZoom(zoom: number | null) {
  eventEmitter.emit<number | null>(events.mapZoomChange, zoom);
}

export const mapZoom$ = eventEmitter
  .observeEvent<number | null>(events.mapZoomChange)
  .pipe(
    RxMap(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => x === y)
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
  .pipe(RxMap(({ eventValue }) => eventValue));

// ----------------------------------------------------------------------------------------------
