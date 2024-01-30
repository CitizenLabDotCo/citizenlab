import React, { useEffect } from 'react';

// Esri
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import Layer from '@arcgis/core/layers/Layer';

// components
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// utils
import { getTileAttribution } from './utils';

type Props = {
  center: GeoJSON.Point;
  height?: string;
  width?: string;
  zoom?: number;
  layers?: Layer[];
};

const EsriMap = ({ center, zoom, layers, height, width }: Props) => {
  const { data: appConfig } = useAppConfiguration();

  useEffect(() => {
    // Get global map settings from the app config
    const globalMapSettings = appConfig?.data.attributes.settings.maps;

    // Create a new map and view
    const esriMap = new Map();

    new MapView({
      container: 'esriMap', // Reference to DOM node that will contain the view
      map: esriMap,
      zoom: zoom || globalMapSettings?.zoom_level,
      center: [center.coordinates[0], center.coordinates[1]],
    });

    // Set the basemap
    const webTileLayerFromUrl = new WebTileLayer({
      urlTemplate: globalMapSettings?.tile_provider,
      copyright: getTileAttribution(globalMapSettings?.tile_provider || ''),
    });
    const basemap = new Basemap({
      baseLayers: [webTileLayerFromUrl],
    });
    esriMap.basemap = basemap;

    // Add any layers that were passed in
    if (layers) {
      layers.forEach((layer) => {
        esriMap.add(layer);
      });
    }
  }, [
    appConfig?.data.attributes.settings.maps,
    center.coordinates,
    layers,
    zoom,
  ]);

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
