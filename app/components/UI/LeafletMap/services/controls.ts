import L from 'leaflet';

export function addLayersControl(map: L.Map) {
  return L.control.layers().addTo(map);
}

export function removeControl(
  map: L.Map,
  layerControl?: L.Control.Layers | null
) {
  if (layerControl) {
    map.removeControl(layerControl);
  }
}
