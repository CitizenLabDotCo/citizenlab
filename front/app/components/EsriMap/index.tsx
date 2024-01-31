import React from 'react';

// Esri
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import Layer from '@arcgis/core/layers/Layer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// utils
import { getMapPinSymbol, getTileAttribution } from './utils';
import { Box } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

type Props = {
  center?: GeoJSON.Point;
  height?: string;
  width?: string;
  zoom?: number;
  maxZoom?: number;
  layers?: Layer[];
  onClick?: (event: any) => void;
  setLocationPoint?: (locationPoint: GeoJSON.Point) => void;
  locationPoint?: GeoJSON.Point;
  graphics?: Graphic[];
};

const EsriMap = ({
  center,
  zoom,
  maxZoom,
  layers,
  onClick,
  height,
  width,
  graphics,
}: Props) => {
  const { data: appConfig } = useAppConfiguration();
  const theme = useTheme();

  // Get global map settings from the app config
  const globalMapSettings = appConfig?.data.attributes.settings.maps;

  // Create a new map and view
  const esriMap = new Map();

  const mapView = new MapView({
    container: 'esriMap', // Reference to DOM node that will contain the view
    map: esriMap,
    zoom: zoom || globalMapSettings?.zoom_level,
    center: center && [center?.coordinates[0], center?.coordinates[1]],
  });

  mapView.constraints = {
    maxZoom: maxZoom || 22,
    minZoom: 8,
  };

  // Set the basemap
  const webTileLayerFromUrl = new WebTileLayer({
    urlTemplate: globalMapSettings?.tile_provider,
    copyright: getTileAttribution(globalMapSettings?.tile_provider || ''),
    maxScale: 10,
  });
  const basemap = new Basemap({
    baseLayers: [webTileLayerFromUrl],
  });
  esriMap.basemap = basemap;

  // Add any graphics that were passed in
  if (graphics) {
    graphics.forEach((graphic) => {
      mapView.graphics.add(graphic);
    });
  }

  // Add any layers that were passed in
  if (layers) {
    layers.forEach((layer) => {
      esriMap.add(layer);
    });
  }

  // // On map click, pass event to handler if it exists
  // mapView.on('click', function (event) {
  //   onClick && onClick(event);
  // });
  mapView.on(
    'click',
    function (event) {
      // Create a graphic and add the geometry and symbol to it
      const graphic = new Graphic({
        geometry: new Point({
          latitude: event.mapPoint.latitude,
          longitude: event.mapPoint.longitude,
        }),
        symbol: getMapPinSymbol(theme.colors.tenantPrimary),
      });
      mapView.graphics.removeAll();
      mapView.graphics.add(graphic);

      onClick && onClick(event);
    },
    []
  );

  return (
    <>
      <link
        rel="stylesheet"
        href="https://js.arcgis.com/4.28/esri/themes/light/main.css"
      />
      <Box
        id="esriMap"
        width={`${width}` || '100%'}
        height={`${height}` || '400px'}
      />
    </>
  );
};

export default EsriMap;
