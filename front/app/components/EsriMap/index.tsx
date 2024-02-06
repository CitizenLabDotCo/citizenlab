import React, { memo, useEffect } from 'react';

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
import { DEFAULT_TILE_PROVIDER } from './constants';

type Props = {
  center?: GeoJSON.Point | null;
  height?: string;
  width?: string;
  zoom?: number;
  maxZoom?: number;
  layers?: Layer[];
  onClick?: (event: any, mapView: MapView) => void;
  onHover?: (event: any, mapView: MapView) => void;
  graphics?: Graphic[];
  showFullscreenOption?: boolean;
};

const EsriMap = memo<Props>(
  ({
    center,
    zoom,
    maxZoom,
    layers,
    onClick,
    onHover,
    height,
    width,
    graphics,
    showFullscreenOption,
  }: Props) => {
    const { data: appConfig } = useAppConfiguration();

    useEffect(() => {
      // Get global map settings from the app config
      const globalMapSettings = appConfig?.data.attributes.settings.maps;

      // Create a new map and map view
      const esriMap = new Map();

      const mapView = new MapView({
        container: 'esriMap', // Reference to DOM node that will contain the view
        map: esriMap,
        zoom: zoom || globalMapSettings?.zoom_level,
        center: !isNil(center)
          ? [center.coordinates[0], center.coordinates[1]]
          : [
              // Otherwise use the default from map settings OR 0,0 if there is no map settings center.
              Number(globalMapSettings?.map_center?.lat) || 0,
              Number(globalMapSettings?.map_center?.long) || 0,
            ],
        constraints: {
          maxZoom: maxZoom || 22,
          minZoom: 5,
        },
      });

      // Set the basemap
      const webTileLayerFromUrl = new WebTileLayer({
        urlTemplate: globalMapSettings?.tile_provider || DEFAULT_TILE_PROVIDER,
        copyright: getTileAttribution(globalMapSettings?.tile_provider || ''),
      });

      esriMap.basemap = new Basemap({
        baseLayers: [webTileLayerFromUrl],
      });

      // Add any layers that were passed in
      if (layers) {
        layers.forEach((layer) => {
          esriMap.add(layer);
        });
      }

      // Add any graphics that were passed in. These should sit on top of any map layers.
      if (graphics) {
        graphics.forEach((graphic) => {
          mapView.graphics.add(graphic);
        });
      }

      // Add fullscreen widget if set
      if (showFullscreenOption) {
        const fullscreen = new Fullscreen({
          view: mapView,
        });
        mapView.ui.add(fullscreen, 'top-right');
      }

      // On map click, pass the event to onClick handler if it was provided
      mapView.on('click', function (event) {
        // By passing the mapview to onClick functions, we can easily change the map from that function
        onClick && onClick(event, mapView);
      });

      // On map hover, pass the event to onHover handler if it was provided
      mapView.on('pointer-move', function (event) {
        onHover && onHover(event, mapView);
      });
    }, [
      appConfig?.data.attributes.settings.maps,
      center,
      graphics,
      layers,
      maxZoom,
      onClick,
      onHover,
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
          width={width ? `${width}` : '100%'}
          height={height ? `${height}` : '400px'}
        />
      </>
    );
  }
);

export default EsriMap;
