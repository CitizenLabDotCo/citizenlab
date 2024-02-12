import React, { useEffect, useRef, useState } from 'react';
import '@arcgis/core/assets/esri/themes/light/main.css';

// components
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import Layer from '@arcgis/core/layers/Layer';
import Graphic from '@arcgis/core/Graphic';
import { Box } from '@citizenlab/cl2-component-library';
import Fullscreen from '@arcgis/core/widgets/Fullscreen';
import Point from '@arcgis/core/geometry/Point';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// utils
import { getDefaultBasemap } from './utils';
import { isNil } from 'utils/helperUtils';
import { EsriUiElement } from './types';

type Props = {
  height?: string;
  width?: string;
  initialData?: InitialData;
};

type InitialData = {
  initialLayers?: Layer[];
  initialCenter?: GeoJSON.Point | null;
  initialGraphics?: Graphic[];
  initialZoom?: number;
  initialMaxZoom?: number;
  initialUiElements?: EsriUiElement[];
  initialShowFullscreenOption?: boolean;
  initialOnClick?: (event: any, mapView: MapView) => void;
  initialOnHover?: (event: any, mapView: MapView) => void;
};

const EsriMap = ({ height, width, initialData }: Props) => {
  const { data: appConfig } = useAppConfiguration();
  const globalMapSettings = appConfig?.data.attributes.settings.maps;

  const [map, setMap] = useState<Map | null>(null);
  const [mapView, setMapView] = useState<MapView | null>(null);

  const initialValuesLoaded = useRef(false);

  // On initial render, create a new map and map view and save them to state variables
  useEffect(() => {
    const newMap = new Map();
    setMap(newMap);

    setMapView(
      new MapView({
        container: 'esriMap', // Reference to DOM node that will contain the view
        map: newMap,
      })
    );
  }, []);

  // Load initial map configuration data that was passed in
  useEffect(() => {
    if (!initialValuesLoaded.current && initialData && mapView && map) {
      // Set map center
      mapView.center = !isNil(initialData.initialCenter)
        ? new Point({
            latitude: initialData.initialCenter.coordinates[1],
            longitude: initialData.initialCenter.coordinates[0],
          })
        : new Point({
            latitude: Number(globalMapSettings?.map_center?.lat) || 0,
            longitude: Number(globalMapSettings?.map_center?.long) || 0,
          });

      // Set the basemap
      map.basemap = new Basemap({
        baseLayers: [getDefaultBasemap(globalMapSettings?.tile_provider)],
      });
      mapView.zoom =
        initialData.initialZoom || globalMapSettings?.zoom_level || 18;
      mapView.constraints = {
        maxZoom: initialData.initialMaxZoom || 22,
        minZoom: 5,
      };

      // Add any layers that were passed in
      if (initialData.initialLayers) {
        map?.removeAll();
        initialData.initialLayers.forEach((layer) => {
          map.add(layer);
        });
      }

      // Add any graphics that were passed in. These should sit on top of any map layers.
      if (initialData.initialGraphics) {
        initialData.initialGraphics.forEach((graphic) => {
          mapView.graphics.add(graphic);
        });
      }

      // Add fullscreen widget if set
      if (initialData.initialShowFullscreenOption) {
        const fullscreen = new Fullscreen({
          view: mapView,
        });
        mapView.ui.add(fullscreen, 'top-right');
      }

      // Add any ui elements that were passed in
      if (initialData.initialUiElements && mapView) {
        initialData.initialUiElements.forEach((uiElement) => {
          mapView.ui.add(uiElement.element, uiElement.position);
        });
      }

      // On map click, pass the event to onClick handler if it was provided
      const onClick = initialData.initialOnClick;
      if (onClick) {
        mapView?.on('click', function (event) {
          // By passing the mapView to onClick functions, we can easily change the map from that function
          onClick(event, mapView);
        });
      }

      // On map hover, pass the event to onHover handler if it was provided
      const onHover = initialData.initialOnHover;
      if (onHover) {
        mapView?.on('pointer-move', function (event) {
          onHover(event, mapView);
        });
      }

      initialValuesLoaded.current = true;
    }
  }, [globalMapSettings, initialData, map, mapView]);

  return (
    <>
      <Box
        id="esriMap"
        width={width ? `${width}` : '100%'}
        height={height ? `${height}` : '400px'}
      />
    </>
  );
};

export default EsriMap;
