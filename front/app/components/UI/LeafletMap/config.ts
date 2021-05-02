import defaultMarker from './default-marker.svg';

export const DEFAULT_CENTER = [0, 0];

export const DEFAULT_ZOOM = 16;

export const DEFAULT_MARKER_ICON_SIZE = [29, 41];

export const DEFAULT_MARKER_ANCHOR_SIZE = [14, 41];

export const DEFAULT_MARKER_ICON = defaultMarker;

export const DEFAULT_BOUND_CONFIG: L.FitBoundsOptions = {
  maxZoom: DEFAULT_ZOOM,
  padding: [50, 50],
};

export const DEFAULT_TILE_PROVIDER =
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const DEFAULT_TILE_OPTIONS = {
  tileSize: 512,
  zoomOffset: -1,
  detectRetina: false,
  minZoom: 1,
  maxZoom: 20,
  crossOrigin: true,
  subdomains: ['a', 'b', 'c'],
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
