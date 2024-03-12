import MapView from '@arcgis/core/views/MapView';

export type EsriUiElement = {
  position:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'manual';
  element: HTMLDivElement;
};

export type InitialData = {
  center?: GeoJSON.Point | null;
  zoom?: number;
  maxZoom?: number;
  uiElements?: EsriUiElement[];
  showFullscreenOption?: boolean;
  showLegend?: boolean;
  showLayerVisibilityControl?: boolean;
  zoomWidgetLocation?: 'left' | 'right';
  onInit?: (mapView: MapView) => void;
};
