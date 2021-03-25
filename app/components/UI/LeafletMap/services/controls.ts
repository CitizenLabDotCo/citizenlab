import L from 'leaflet';

export function addLayersControl(map: L.Map) {
  return L.control.layers().addTo(map);
}

export function removeLayersControl(
  map: L.Map,
  layersControl?: L.Control.Layers | null
) {
  if (layersControl) {
    map.removeControl(layersControl);
  }
}
