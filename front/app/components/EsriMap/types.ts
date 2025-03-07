import MapView from '@arcgis/core/views/MapView';

export type DefaultBasemapType = 'BasemapAt' | 'MapTiler';

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
  showZoomControls?: boolean;
  zoomWidgetLocation?: 'left' | 'right';
  showLegendExpanded?: boolean;
  onInit?: (mapView: MapView) => void;
};
