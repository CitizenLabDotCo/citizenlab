import React, { useEffect } from 'react';

// components
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import Layer from '@arcgis/core/layers/Layer';
import Graphic from '@arcgis/core/Graphic';
import { Box } from '@citizenlab/cl2-component-library';
import Fullscreen from '@arcgis/core/widgets/Fullscreen';

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
  showFullscreenOption?: boolean;
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
  showFullscreenOption,
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

    // Add fullscreen widget if applicable
    if (showFullscreenOption) {
      const fullscreen = new Fullscreen({
        view: mapView,
      });
      mapView.ui.add(fullscreen, 'top-right');
    }

    // On map click, pass event to handler if it was passed in
    mapView.on('click', function (event) {
      // By passing the mapview to the onClick function, we can easily change map data from that function
      onClick && onClick(event, mapView);
    });
  }, [
    appConfig?.data.attributes.settings.maps,
    center,
    graphics,
    layers,
    maxZoom,
    onClick,
    showFullscreenOption,
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
