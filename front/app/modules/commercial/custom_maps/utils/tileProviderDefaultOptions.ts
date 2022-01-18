export const MAPTILER_DEFAULT_OPTIONS = {
  tileSize: 512,
  zoomOffset: -1,
  detectRetina: false,
  minZoom: 1,
  maxZoom: 19,
  crossOrigin: true,
  subdomains: ['a', 'b', 'c'],
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
};

export const BASEMAP_AT_DEFAULT_OPTIONS = {
  tileSize: 256,
  crossOrigin: true,
  minZoom: 1,
  maxZoom: 18,
  subdomains: ['maps', 'maps1', 'maps2', 'maps3'],
  attribution:
    'Karte: <a href="http://basemap.at" target="_blank">basemap.at</a>, <a href="http://creativecommons.org/licenses/by/3.0/at/deed.de" target="_blank">CC-BY 3.0</a>',
};
