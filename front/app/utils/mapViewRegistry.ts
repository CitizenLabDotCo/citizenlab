import type MapView from '@arcgis/core/views/MapView';

/**
 * Module-level registry for ArcGIS MapView instances, keyed by customFieldId.
 * Used by the Word export serializer to capture map screenshots via
 * MapView.takeScreenshot().
 */
const mapViews = new Map<string, MapView>();

export const registerMapView = (id: string, view: MapView) => {
  mapViews.set(id, view);
};

export const unregisterMapView = (id: string) => {
  mapViews.delete(id);
};

export const getMapView = (id: string): MapView | undefined => {
  return mapViews.get(id);
};

export const getAllMapViews = (): Map<string, MapView> => {
  return mapViews;
};
