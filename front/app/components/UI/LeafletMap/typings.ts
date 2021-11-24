export interface Point extends GeoJSON.Point {
  data?: any;
  id: string;
  title?: string;
}

export interface GeoJSONLayer {
  geojson?: GeoJSON.Feature;
  [key: string]: any;
}

export type IMarkerLayerFunction = (
  layer: GeoJSONLayer,
  latlng: L.LatLng
) => string;

export type ILayerOverlayFunction = (geojsonLayer: GeoJSONLayer) => string;

export type IPopupFunction = (
  layer: L.GeoJSON,
  feature: GeoJSON.Feature
) => string;

export type ITooltipFunction = (
  layer: L.GeoJSON,
  feature: GeoJSON.Feature
) => string;

export type IMarkerStringOrObjectOrFunctionForLayer =
  | IMarkerLayerFunction
  | string
  | MarkerIconProps;

export type IOverlayStringOrObjectOrFunctionForLayer =
  | ILayerOverlayFunction
  | string;

export type ITooltipStringOrObjectOrFunctionForLayer =
  | ITooltipFunction
  | string;

export type IPopupStringOrObjectOrFunctionForLayer = IPopupFunction | string;

export type MarkerIconProps = {
  url: string;
  iconSize?: [number, number];
  iconAnchor?: [number, number];
};
