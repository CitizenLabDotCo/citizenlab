import {
  isNilOrError,
  isFunction,
  isString,
  isOrReturnsString,
} from 'utils/helperUtils';
import L from 'leaflet';
import { isEmpty, cloneDeep, reverse } from 'lodash-es';

import { markerIcon } from './markers';

import {
  GeoJSONLayer,
  IMarkerStringOrObjectOrFunctionForLayer,
  IOverlayStringOrObjectOrFunctionForLayer,
  ITooltipStringOrObjectOrFunctionForLayer,
  IPopupStringOrObjectOrFunctionForLayer,
} from '../typings';

import { DEFAULT_MARKER_ICON } from '../config';

export function addPopupToLayer(
  layer: L.GeoJSON,
  feature: GeoJSON.Feature,
  popupStringOrFunction?: IPopupStringOrObjectOrFunctionForLayer
) {
  if (!popupStringOrFunction) {
    return;
  }

  let popup: string = '';

  if (isFunction(popupStringOrFunction)) {
    popup = popupStringOrFunction(layer, feature);
  } else if (isString(popupStringOrFunction)) {
    popup = popupStringOrFunction;
  }

  if (popup && !isEmpty(popup)) {
    layer.bindPopup(popup);
  }
}

export function addTooltipToLayer(
  layer: L.GeoJSON,
  feature: GeoJSON.Feature,
  tooltipStringOrFunction?: ITooltipStringOrObjectOrFunctionForLayer
): void {
  if (!tooltipStringOrFunction) {
    return;
  }

  let tooltip: string = '';

  if (isFunction(tooltipStringOrFunction)) {
    tooltip = tooltipStringOrFunction(layer, feature);
  } else if (isString(tooltipStringOrFunction)) {
    tooltip = tooltipStringOrFunction;
  }

  if (tooltip && !isEmpty(tooltip)) {
    layer.bindTooltip(tooltip);
  }
}

export function addLayerOverlay(
  layer: L.GeoJSON,
  layerControl: L.Control.Layers,
  geoJSONLayer: GeoJSONLayer,
  overlayStringOrOptionsOrFunction: IOverlayStringOrObjectOrFunctionForLayer
): void {
  let overlayContent;

  if (isString(overlayStringOrOptionsOrFunction)) {
    overlayContent = overlayStringOrOptionsOrFunction;
  } else if (isFunction(overlayStringOrOptionsOrFunction)) {
    overlayContent = overlayStringOrOptionsOrFunction(geoJSONLayer);
  }

  if (isString(overlayContent)) {
    layerControl.addOverlay(layer, overlayContent);
  }
}

export function layerMarker(
  geojsonLayer: GeoJSONLayer,
  latlng: L.LatLng,
  markerStringOrOptionsOrFunction: IMarkerStringOrObjectOrFunctionForLayer,
  options = {}
): L.Marker {
  let marker: L.Icon;

  if (isString(markerStringOrOptionsOrFunction)) {
    marker = markerIcon({ url: markerStringOrOptionsOrFunction });
  } else if (
    isOrReturnsString(markerStringOrOptionsOrFunction, geojsonLayer, latlng)
  ) {
    marker = markerIcon({
      url: markerStringOrOptionsOrFunction(geojsonLayer, latlng),
    });
  } else if (isFunction(markerStringOrOptionsOrFunction)) {
    marker = markerIcon(markerStringOrOptionsOrFunction(geojsonLayer, latlng));
  } else {
    marker = markerIcon(markerStringOrOptionsOrFunction);
  }

  return L.marker(latlng, { ...options, icon: marker || DEFAULT_MARKER_ICON });
}

export function addLayers(
  map: L.Map,
  layersGeoJson: GeoJSONLayer[],
  { layerControl, overlay, popup, tooltip, marker }
): L.GeoJSON[] {
  return reverse(cloneDeep(layersGeoJson))
    ?.filter((layerObject) => !isEmpty(layerObject.geojson))
    .map((layerObject) => {
      const options = {
        useSimpleStyle: true,
        useMakiMarkers: true,
        pointToLayer: (_feature, latlng) => {
          layerMarker(layerObject, latlng, marker);
        },
        onEachFeature: (feature, layer) => {
          addTooltipToLayer(layer, feature, tooltip);
          addPopupToLayer(layer, feature, popup);
        },
      };

      const layer = L.geoJSON(layerObject.geojson, options as any).addTo(map);

      if (!isNilOrError(layerControl) && !isNilOrError(overlay)) {
        addLayerOverlay(layer, layerControl, layerObject, overlay);
      }

      return layer as L.GeoJSON;
    });
}

export function removeLayers(map: L.Map, leafletLayers: L.Layer[]): void {
  leafletLayers.forEach((layer) => {
    removeLayer(map, layer);
  });
}

export function removeLayer(map: L.Map, leafletLayer: L.Layer): void {
  if (leafletLayer) {
    map.removeLayer(leafletLayer);
  }
}
