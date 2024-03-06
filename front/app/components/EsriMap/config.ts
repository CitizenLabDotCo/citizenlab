import Fullscreen from '@arcgis/core/widgets/Fullscreen';
import Point from '@arcgis/core/geometry/Point';
import Legend from '@arcgis/core/widgets/Legend';
import Expand from '@arcgis/core/widgets/Expand';
import LayerList from '@arcgis/core/widgets/LayerList';

// typings
import MapView from '@arcgis/core/views/MapView';
import { InitialData } from './types';
import { AppConfigurationMapSettings } from 'api/app_configuration/types';

export const configureMapView = (
  mapView: MapView,
  initialData: InitialData | undefined,
  globalMapSettings: AppConfigurationMapSettings,
  isMobileOrSmaller: boolean
) => {
  // Set map center
  setMapCenter(mapView, initialData, globalMapSettings);

  // Set initial extent
  mapView.zoom = initialData?.zoom || globalMapSettings.zoom_level || 18;
  mapView.constraints = {
    maxZoom: initialData?.maxZoom || 22,
    minZoom: 5,
  };

  // Change location of zoom widget if specified
  if (initialData?.zoomWidgetLocation === 'right') {
    const zoom = mapView.ui.find('zoom');
    mapView.ui.add(zoom, 'top-right');
  }

  // Add fullscreen widget if set
  if (initialData?.showFullscreenOption) {
    const fullscreen = new Fullscreen({
      view: mapView,
    });
    mapView.ui.add(fullscreen, 'top-right');
  }

  // Add map legend if set
  if (initialData?.showLegend) {
    addMapLegend(mapView, isMobileOrSmaller);
  }

  // Show layer visibility controls if set
  if (initialData?.showLayerVisibilityControl) {
    showLayerVisibilityControls(mapView);
  }

  // Add any ui elements that were passed in
  if (initialData?.uiElements && mapView) {
    initialData?.uiElements.forEach((uiElement) => {
      mapView.ui.add(uiElement.element, uiElement.position);
    });
  }
};

// setMapCenter
// Description: Set the center of the map
export const setMapCenter = (
  mapView: MapView,
  initialData: InitialData | undefined,
  globalMapSettings: AppConfigurationMapSettings
) => {
  mapView.center = initialData?.center
    ? new Point({
        latitude: initialData?.center.coordinates[1],
        longitude: initialData?.center.coordinates[0],
      })
    : new Point({
        latitude: Number(globalMapSettings.map_center?.lat) || 0,
        longitude: Number(globalMapSettings.map_center?.long) || 0,
      });
};

// addMapLegend
// Description: Adds a legend to the map
export const addMapLegend = (mapView: MapView, isMobileOrSmaller: boolean) => {
  const legend = new Expand({
    content: new Legend({
      view: mapView,
      hideLayersNotInCurrentView: false,
      style: { type: 'classic', layout: 'stack' },
    }),
    view: mapView,
    expanded: isMobileOrSmaller ? false : true,
    mode: 'floating',
  });

  mapView.ui.add(legend, 'bottom-right');
};

// showLayerVisibilityControls
// Description: Shows the layer visibility controls on the map
export const showLayerVisibilityControls = (mapView: MapView) => {
  const layerList = new Expand({
    content: new LayerList({
      view: mapView,
    }),
    view: mapView,
    expanded: false,
    mode: 'floating',
  });
  mapView.ui.add(layerList, {
    position: 'bottom-right',
  });
};
