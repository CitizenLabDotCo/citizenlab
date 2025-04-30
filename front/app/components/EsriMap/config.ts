import Point from '@arcgis/core/geometry/Point';
import MapView from '@arcgis/core/views/MapView';
import Expand from '@arcgis/core/widgets/Expand';
import Fullscreen from '@arcgis/core/widgets/Fullscreen';
import LayerList from '@arcgis/core/widgets/LayerList';
import Legend from '@arcgis/core/widgets/Legend';

// typings

import { AppConfigurationMapSettings } from 'api/app_configuration/types';

import { calculateScaleFromZoom } from 'utils/mapUtils/map';

import { InitialData } from './types';

export const configureMapView = (
  mapView: MapView,
  initialData: InitialData | undefined,
  globalMapSettings: AppConfigurationMapSettings,
  isMobileOrSmaller: boolean
) => {
  // Set map center
  setMapCenter(mapView, initialData, globalMapSettings);

  // Set initial extent
  const zoomLevel = initialData?.zoom || globalMapSettings.zoom_level || 18;
  mapView.zoom = zoomLevel;
  mapView.constraints = {
    maxZoom: initialData?.maxZoom || 22,
    minZoom: 5,
  };

  // Note: Here we set the map scale manually if the spatial reference is not Web Mercator (3857) or WGS84 (4326).
  //
  // Why? - Only Web Mercator & WGS84 can work with fixed zoom levels — other projections (like national/local grids)
  // don't support zoom levels in the same way, so mapView.zoom won't behave as expected.
  //
  // The vast majority of maps on our platform are in Web Mercator, but some maps (like the UK and Finnish maps)
  // sometimes use a different projection and need this specific handling.
  //
  // Setting mapView.scale ensures consistent map zooming behavior across all projections.
  const spatialReferenceId = mapView.center.spatialReference.wkid;
  if (spatialReferenceId !== 3857 && spatialReferenceId !== 4326) {
    mapView.scale = calculateScaleFromZoom(zoomLevel);
  }

  // Change location of zoom widget if specified
  if (initialData?.showZoomControls === false || isMobileOrSmaller) {
    const zoom = mapView.ui.find('zoom');
    mapView.ui.remove(zoom);
  } else if (initialData?.zoomWidgetLocation === 'right') {
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
    addMapLegend(mapView, isMobileOrSmaller, initialData.showLegendExpanded);
  }

  // Show layer visibility controls if set
  if (initialData?.showLayerVisibilityControl) {
    showLayerVisibilityControls(mapView);
  }

  // Add any ui elements that were passed in
  if (initialData?.uiElements) {
    initialData.uiElements.forEach((uiElement) => {
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
        latitude: initialData.center.coordinates[1],
        longitude: initialData.center.coordinates[0],
      })
    : new Point({
        latitude: Number(globalMapSettings.map_center.lat) || 0,
        longitude: Number(globalMapSettings.map_center.long) || 0,
      });
};

// addMapLegend
// Description: Adds a legend to the map
export const addMapLegend = (
  mapView: MapView,
  isMobileOrSmaller: boolean,
  showLegendExpanded: boolean | undefined
) => {
  const legend = new Expand({
    content: new Legend({
      view: mapView,
      hideLayersNotInCurrentView: false,
      style: { type: 'classic', layout: 'stack' },
    }),
    view: mapView,
    expanded:
      showLegendExpanded === undefined
        ? !isMobileOrSmaller // By default, show the legend expanded only on desktop
        : showLegendExpanded,
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
    position: 'top-right',
  });
};
