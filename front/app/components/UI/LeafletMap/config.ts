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
  'https://api.maptiler.com/maps/77632ac6-e168-429c-8b1b-76599ce796e3/{z}/{x}/{y}@2x.png?key=DIZiuhfkZEQ5EgsaTk6D';

export const DEFAULT_TILE_OPTIONS = {
  tileSize: 512,
  zoomOffset: -1,
  minZoom: 1,
  maxZoom: 20,
  crossOrigin: true,
  subdomains: ['a', 'b', 'c'],
  attribution:
    '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
};
