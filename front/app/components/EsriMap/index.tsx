import React, { useEffect, useRef, useState } from 'react';
import '@arcgis/core/assets/esri/themes/light/main.css';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocale from 'hooks/useLocale';

// components
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import Layer from '@arcgis/core/layers/Layer';
import Graphic from '@arcgis/core/Graphic';
import { Box, media, useBreakpoint } from '@citizenlab/cl2-component-library';
import Fullscreen from '@arcgis/core/widgets/Fullscreen';
import Point from '@arcgis/core/geometry/Point';
import Expand from '@arcgis/core/widgets/Expand';
import Legend from '@arcgis/core/widgets/Legend';
import LayerList from '@arcgis/core/widgets/LayerList';
import WebMap from '@arcgis/core/WebMap';
import Collection from '@arcgis/core/core/Collection';

// utils
import { getDefaultBasemap } from './utils';
import { isNil } from 'utils/helperUtils';
import { debounce } from 'lodash-es';
import styled from 'styled-components';
import * as intl from '@arcgis/core/intl.js';

// typings
import { EsriUiElement } from './types';
import { AppConfigurationMapSettings } from 'api/app_configuration/types';

// Custom Esri styles
const MapContainer = styled(Box)`
  .esri-legend--card__message {
    display: none;
  }

  .esri-legend {
    max-height: 200px !important;
  }

  ${media.phone`
    .esri-legend {
      max-width: 240px !important;
    }
    .esri-layer-list {
      max-width: 220px !important;
    }
  `}
`;

export type EsriMapProps = {
  id?: string;
  height?: string;
  width?: string;
  initialData?: InitialData;
  layers?: Layer[];
  graphics?: Graphic[];
  onClick?: (event: any, mapView: MapView) => void;
  onHover?: (event: any, mapView: MapView) => void;
  globalMapSettings: AppConfigurationMapSettings;
};

type InitialData = {
  center?: GeoJSON.Point | null;
  zoom?: number;
  maxZoom?: number;
  uiElements?: EsriUiElement[];
  showFullscreenOption?: boolean;
  showLegend?: boolean;
  showLayerVisibilityControl?: boolean;
  zoomWidgetLocation?: 'left' | 'right';
  webMapId?: string | null;
  onInit?: (mapView: MapView) => void;
};

const EsriMap = ({
  id,
  height,
  width,
  layers,
  graphics,
  onClick,
  onHover,
  initialData,
  globalMapSettings,
}: EsriMapProps) => {
  const locale = useLocale();
  const isMobileOrSmaller = useBreakpoint('phone');
  const [map, setMap] = useState<Map | null>(null);
  const [webMap, setWebMap] = useState<WebMap | null>(null);
  const [mapView, setMapView] = useState<MapView | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  const initialValuesLoaded = useRef(false);

  // Sets the locale of the map
  intl.setLocale(locale);

  // On initial render, create a new map and map view and save them to state variables
  useEffect(() => {
    if (mapRef.current) {
      const newMap = new Map();
      const mapView = new MapView({
        container: mapRef.current, // Reference to DOM node that will contain the view
        map: newMap,
        popup: {
          dockEnabled: false,
          dockOptions: {
            breakpoint: false,
          },
        },
      });

      setMap(newMap);
      setMapView(mapView);
      return () => {
        mapView.destroy();
      };
    }

    return;
  }, []);

  // Load initial map configuration data that was passed in.
  // Note: This data is static and will not change.
  useEffect(() => {
    if (!initialValuesLoaded.current && mapView && map) {
      // Set map center
      mapView.center = !isNil(initialData?.center)
        ? new Point({
            latitude: initialData?.center.coordinates[1],
            longitude: initialData?.center.coordinates[0],
          })
        : new Point({
            latitude: Number(globalMapSettings.map_center?.lat) || 0,
            longitude: Number(globalMapSettings.map_center?.long) || 0,
          });

      // Set the basemap
      map.basemap = new Basemap({
        baseLayers: [getDefaultBasemap(globalMapSettings.tile_provider)],
      });
      mapView.zoom = initialData?.zoom || globalMapSettings.zoom_level || 18;
      mapView.constraints = {
        maxZoom: initialData?.maxZoom || 22,
        minZoom: 5,
      };

      // Set web map if it was provided
      if (initialData?.webMapId) {
        const webMap = new WebMap({
          portalItem: {
            id: initialData?.webMapId,
          },
        });

        setWebMap(webMap);
        mapView.map = webMap;
      }

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
      }

      // Show layer visibility controls if set
      if (initialData?.showLayerVisibilityControl) {
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
      }

      // Add any ui elements that were passed in
      if (initialData?.uiElements && mapView) {
        initialData?.uiElements.forEach((uiElement) => {
          mapView.ui.add(uiElement.element, uiElement.position);
        });
      }

      // Run onInit function if it was provided
      if (initialData?.onInit) {
        initialData.onInit(mapView);
      }

      initialValuesLoaded.current = true;
    }
  }, [globalMapSettings, initialData, isMobileOrSmaller, map, mapView]);

  // Load dynamic data that was passed in.
  // Note: This data is dynamic and may change.
  useEffect(() => {
    // Add any map layers which were passed in
    webMap?.when(() => {
      if (webMap && layers) {
        layers.forEach((layer) => {
          webMap.remove(layer);
          webMap.add(layer);
        });

        if (layers.find((layer) => layer.id === 'ideasLayer')) {
          const ideasLayer = layers.find((layer) => layer.id === 'ideasLayer');
          if (ideasLayer) {
            webMap.remove(ideasLayer);
            webMap.add(ideasLayer);
          }
        }
        console.log('Layers: ', webMap.allLayers);
        return;
      }
    });

    if (map && layers) {
      map?.removeAll();
      layers.forEach((layer) => {
        map.add(layer);
      });
    }
  }, [layers, map, webMap]);

  useEffect(() => {
    // Add any graphics which were passed in
    if (mapView && graphics) {
      mapView.graphics.removeAll();
      graphics.forEach((graphic) => {
        mapView.graphics.add(graphic);
      });
    }
  }, [graphics, mapView]);

  useEffect(() => {
    // On map click, pass the event to onClick handler if it was provided
    if (onClick) {
      mapView?.on('click', function (event) {
        // By passing the mapView to onClick functions, we can easily change the map from that function
        onClick(event, mapView);
      });
    }
  }, [onClick, mapView]);

  useEffect(() => {
    webMap?.layers.on('after-changes', function () {
      console.log('Layers changed! Re-ordering...');

      // TODO : Continue here
      webMap?.reorder(
        webMap?.layers.find((layer) => layer.id === 'ideasLayer'),
        webMap?.layers.length - 1
      );
      const basemapCopy = webMap?.basemap.clone();
      const test = new Collection<Layer>();
      basemapCopy.referenceLayers = test;
      webMap.basemap = basemapCopy;
    });
  }, [webMap?.layers, webMap]);

  useEffect(() => {
    // On map hover, pass the event to hover handler if it was provided
    if (onHover && mapView) {
      const debouncedHover = debounce((event: any) => {
        onHover(event, mapView);
      }, 60);

      mapView.on('pointer-move', debouncedHover);
    }
  }, [onHover, mapView]);

  return (
    <>
      <MapContainer
        id={id}
        ref={mapRef}
        width={width ? `${width}` : '100%'}
        height={height ? `${height}` : '400px'}
      />
    </>
  );
};

const EsriMapWrapper = (props: Omit<EsriMapProps, 'globalMapSettings'>) => {
  const { data: appConfig } = useAppConfiguration();
  const globalMapSettings = appConfig?.data.attributes.settings.maps;

  if (globalMapSettings) {
    return <EsriMap globalMapSettings={globalMapSettings} {...props} />;
  }

  return null;
};

export default EsriMapWrapper;
