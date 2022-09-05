import L from 'leaflet';

export function addLayersControl(
  map: L.Map | null | undefined,
  position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright'
) {
  if (map) {
    return L.control
      .layers(undefined, undefined, { position: position || 'topright' })
      .addTo(map);
  }

  return null;
}

export function removeLayersControl(
  map: L.Map | null | undefined,
  layersControl?: L.Control.Layers | null
) {
  if (map && layersControl) {
    map.removeControl(layersControl);
  }
}
