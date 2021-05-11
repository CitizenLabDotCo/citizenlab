import L from 'leaflet';

export function addLayersControl(
  map: L.Map,
  position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright'
) {
  return L.control
    .layers(undefined, undefined, { position: position || 'topright' })
    .addTo(map);
}

export function removeLayersControl(
  map: L.Map,
  layersControl?: L.Control.Layers | null
) {
  if (layersControl) {
    map.removeControl(layersControl);
  }
}
