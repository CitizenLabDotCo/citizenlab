import {
  isNilOrError,
  isFunction,
  isString,
  isOrReturnsString,
} from 'utils/helperUtils';
import L from 'leaflet';
import { isEmpty, cloneDeep, reverse } from 'lodash-es';

import { getMarkerIcon } from './markers';

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

  let popup = '';

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
) {
  if (!tooltipStringOrFunction) {
    return;
  }

  let tooltip = '';

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
  layersControl: L.Control.Layers,
  geoJSONLayer: GeoJSONLayer,
  overlayStringOrOptionsOrFunction: IOverlayStringOrObjectOrFunctionForLayer
) {
  let overlayContent: string | undefined = undefined;

  if (isString(overlayStringOrOptionsOrFunction)) {
    overlayContent = overlayStringOrOptionsOrFunction;
  } else if (isFunction(overlayStringOrOptionsOrFunction)) {
    overlayContent = overlayStringOrOptionsOrFunction(geoJSONLayer);
  }

  if (isString(overlayContent)) {
    layersControl.addOverlay(layer, overlayContent);
  }
}

export function layerMarker(
  geojsonLayer: GeoJSONLayer,
  latlng: L.LatLng,
  markerStringOrOptionsOrFunction: IMarkerStringOrObjectOrFunctionForLayer,
  options = {}
) {
  let marker: L.Icon;

  if (isString(markerStringOrOptionsOrFunction)) {
    marker = getMarkerIcon({ url: markerStringOrOptionsOrFunction });
  } else if (
    isOrReturnsString(markerStringOrOptionsOrFunction, geojsonLayer, latlng)
  ) {
    marker = getMarkerIcon({
      url: markerStringOrOptionsOrFunction(geojsonLayer, latlng),
    });
  } else if (isFunction(markerStringOrOptionsOrFunction)) {
    marker = getMarkerIcon(
      markerStringOrOptionsOrFunction(geojsonLayer, latlng)
    );
  } else {
    marker = getMarkerIcon(markerStringOrOptionsOrFunction);
  }

  return L.marker(latlng, {
    ...options,
    icon: marker || DEFAULT_MARKER_ICON,
  });
}

export function addLayers(
  map: L.Map | null | undefined,
  geoJsonLayers: GeoJSONLayer[] | null | undefined,
  { layersControl, overlay, popup, tooltip, marker }
) {
  if (map && geoJsonLayers && geoJsonLayers.length > 0) {
    const layers = reverse(cloneDeep(geoJsonLayers))
      ?.filter((geoJsonLayer) => !isEmpty(geoJsonLayer.geojson))
      .map((geoJsonLayer) => {
        const options = {
          useSimpleStyle: true,
          useMakiMarkers: true,
          pointToLayer: (_feature, latlng) => {
            return layerMarker(geoJsonLayer, latlng, marker);
          },
          onEachFeature: (feature, layer) => {
            addTooltipToLayer(layer, feature, tooltip);
            addPopupToLayer(layer, feature, popup);
          },
        };

        const layer = L.geoJSON(geoJsonLayer.geojson, options as any).addTo(
          map
        );

        return {
          layer,
          geoJsonLayer,
        };
      });

    reverse(cloneDeep(layers)).forEach(({ layer, geoJsonLayer }) => {
      if (!isNilOrError(layersControl) && !isNilOrError(overlay)) {
        addLayerOverlay(layer, layersControl, geoJsonLayer, overlay);
      }
    });

    return layers.map(({ layer }) => layer);
  }

  return [] as L.GeoJSON[];
}

export function removeLayers(
  map: L.Map | null | undefined,
  leafletLayers?: L.Layer[] | L.Marker<any>[] | null
) {
  if (leafletLayers && leafletLayers.length > 0) {
    leafletLayers.forEach((layer) => {
      removeLayer(map, layer);
    });
  }
}

export function removeLayer(
  map: L.Map | null | undefined,
  leafletLayer: L.Layer | null | undefined
) {
  if (map && leafletLayer) {
    leafletLayer?.off?.('click');
    leafletLayer?.off?.('mouseover');
    leafletLayer?.off?.('mouseout');
    map.removeLayer(leafletLayer);
  }
}
