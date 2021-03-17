import L from 'leaflet';

export function addLayersControl(map: L.Map): L.Control.Layers {
  return L.control.layers().addTo(map);
}

export function removeControl(
  map: L.Map,
  layerControl?: L.Control.Layers | null
): void {
  if (layerControl) {
    map.removeControl(layerControl);
  }
}
