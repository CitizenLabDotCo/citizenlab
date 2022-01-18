import defaultMarker from './default-marker.svg';
import defaultHoverMarker from './default-marker-hover.svg';
import defaultActiveMarker from './default-marker-active.svg';
import { LatLngTuple } from 'leaflet';

export const DEFAULT_CENTER = [0, 0] as LatLngTuple;

export const DEFAULT_ZOOM = 16;

export const DEFAULT_MARKER_ICON_SIZE = [29, 41];

export const DEFAULT_MARKER_ANCHOR_SIZE = [14, 41];

export const DEFAULT_MARKER_ICON = defaultMarker;

export const DEFAULT_MARKER_HOVER_ICON = defaultHoverMarker;

export const DEFAULT_MARKER_ACTIVE_ICON = defaultActiveMarker;

export const DEFAULT_TILE_PROVIDER =
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const DEFAULT_TILE_OPTIONS = {
  minZoom: 1,
  maxZoom: 19,
  crossOrigin: true,
  subdomains: ['a', 'b', 'c'],
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
};
