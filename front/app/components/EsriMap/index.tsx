import React, { useEffect } from 'react';

// components
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import Layer from '@arcgis/core/layers/Layer';
import Graphic from '@arcgis/core/Graphic';
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// utils
import { getTileAttribution } from './utils';
import { isNil } from 'utils/helperUtils';

type Props = {
  center?: GeoJSON.Point | null;
  height?: string;
  width?: string;
  zoom?: number;
  maxZoom?: number;
  layers?: Layer[];
  onClick?: (event: any, mapView: MapView) => void;
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

  useEffect(() => {
    // Get global map settings from the app config
    const globalMapSettings = appConfig?.data.attributes.settings.maps;

    // Create a new map and view
    const esriMap = new Map();

    const mapView = new MapView({
      container: 'esriMap', // Reference to DOM node that will contain the view
      map: esriMap,
      zoom: zoom || globalMapSettings?.zoom_level,
      center: !isNil(center)
        ? [center.coordinates[0], center.coordinates[1]]
        : undefined,
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
    mapView.on('click', function (event) {
      onClick && onClick(event, mapView);
    });
  }, [
    appConfig?.data.attributes.settings.maps,
    center,
    graphics,
    layers,
    maxZoom,
    onClick,
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
