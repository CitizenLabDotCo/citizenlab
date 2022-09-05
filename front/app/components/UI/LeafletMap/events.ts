import {
  distinctUntilChanged,
  map,
  publishReplay,
  refCount,
  debounceTime,
} from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import eventEmitter from 'utils/eventEmitter';
import { LatLngTuple } from 'leaflet';

enum events {
  leafletMapCenterChange = 'leafletMapCenterChange',
  leafletMapZoomChange = 'leafletMapZoomChange',
  leafletMapLatLngZoomChange = 'leafletMapLatLngZoomChange',
  leafletMapHoveredMarkerChange = 'leafletMapHoveredMarkerChange',
  leafletMapSelectedMarkerChange = 'leafletMapSelectedMarkerChange',
  leafletMapClicked = 'leafletMapClicked',
}

// ----------------------------------------------------------------------------------------------

export function setLeafletMapCenter(center: LatLngTuple | null) {
  eventEmitter.emit<LatLngTuple | null>(events.leafletMapCenterChange, center);
}

export const leafletMapCenter$ = eventEmitter
  .observeEvent<LatLngTuple | null>(events.leafletMapCenterChange)
  .pipe(
    map(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => isEqual(x, y)),
    publishReplay(1),
    refCount()
  );

// ----------------------------------------------------------------------------------------------

export function setLeafletMapZoom(zoom: number | null) {
  eventEmitter.emit<number | null>(events.leafletMapZoomChange, zoom);
}

export const leafletMapZoom$ = eventEmitter
  .observeEvent<number | null>(events.leafletMapZoomChange)
  .pipe(
    map(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => isEqual(x, y)),
    publishReplay(1),
    refCount()
  );

// ----------------------------------------------------------------------------------------------

export function setLeafletMapHoveredMarker(markerId: string | null) {
  eventEmitter.emit<string | null>(
    events.leafletMapHoveredMarkerChange,
    markerId
  );
}

export const leafletMapHoveredMarker$ = eventEmitter
  .observeEvent<string | null>(events.leafletMapHoveredMarkerChange)
  .pipe(
    map(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => isEqual(x, y))
  );

// ----------------------------------------------------------------------------------------------

export function setLeafletMapSelectedMarker(markerId: string | null) {
  eventEmitter.emit<string | null>(
    events.leafletMapSelectedMarkerChange,
    markerId
  );
}

export const leafletMapSelectedMarker$ = eventEmitter
  .observeEvent<string | null>(events.leafletMapSelectedMarkerChange)
  .pipe(
    map(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => isEqual(x, y))
  );

// ----------------------------------------------------------------------------------------------

export function setLeafletMapClicked(latLng: L.LatLng) {
  eventEmitter.emit<L.LatLng>(events.leafletMapClicked, latLng);
}

export const leafletMapClicked$ = eventEmitter
  .observeEvent<L.LatLng>(events.leafletMapClicked)
  .pipe(
    map(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => isEqual(x, y)),
    debounceTime(50)
  );

// ----------------------------------------------------------------------------------------------
