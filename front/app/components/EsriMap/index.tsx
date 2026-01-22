import React, { useEffect, useRef, useState } from 'react';

import Basemap from '@arcgis/core/Basemap';
import esriConfig from '@arcgis/core/config';
import Collection from '@arcgis/core/core/Collection';
import Graphic from '@arcgis/core/Graphic';
import { setLocale as setEsriLocale } from '@arcgis/core/intl/locale.js';
import Layer from '@arcgis/core/layers/Layer';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import { Box, media, useBreakpoint } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import styled from 'styled-components';
import '@arcgis/core/assets/esri/css/main.css';

import { AppConfigurationMapSettings } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import { configureMapView } from './config';
import { InitialData, DefaultBasemapType } from './types';
import {
  getDefaultBasemapType,
  getDefaultBasemap,
  handleWebMapReferenceLayers,
  createUserLocationGraphic,
  useLabelExpandButtons,
} from './utils';

// Custom Esri styles
const MapContainer = styled(Box)<{
  basemapType: DefaultBasemapType;
}>`
  background: ${(props) =>
    `${props.basemapType === 'BasemapAt' ? 'white' : ''}`};

  .esri-legend--card__message {
    display: none;
  }

  .esri-legend {
    max-height: 120px !important;
  }

  .esri-layer-list {
    max-height: 200px !important;
  }

  .esri-ui-corner .esri-component {
    box-shadow: none !important;
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
  webMapId?: string | null;
  onClick?: (event: any, mapView: MapView) => void;
  onHover?: (event: any, mapView: MapView) => void;
  globalMapSettings: AppConfigurationMapSettings;
  showUserLocation?: boolean;
};

const EsriMap = ({
  id,
  height,
  width,
  layers,
  graphics,
  onClick,
  onHover,
  webMapId,
  initialData,
  globalMapSettings,
  showUserLocation = false,
}: EsriMapProps) => {
  const locale = useLocale();
  const isMobileOrSmaller = useBreakpoint('phone');
  const { data: appConfig } = useAppConfiguration();

  const [map, setMap] = useState<Map | WebMap | null>(null);
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [referenceLayers, setReferenceLayers] =
    useState<Collection<Layer> | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const [updateMapViewConfig, setUpdateMapViewConfig] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const mapRefAvailable = !!mapRef.current;

  // for Accessibility: add labels to the expand buttons in the map's legend and layer list

  useLabelExpandButtons({ mapView });

  useEffect(() => {
    if (!mapRefAvailable) return;

    let map: Map | WebMap;

    if (webMapId) {
      map = new WebMap({ portalItem: { id: webMapId } });
    } else {
      map = new Map();
      map.basemap = new Basemap({
        baseLayers: [getDefaultBasemap(globalMapSettings.tile_provider)],
      });
    }

    setMap(map);

    const mapView = new MapView({
      container: mapRef.current as HTMLDivElement, // Reference to DOM node that will contain the view
      map,
      popupEnabled: false,
      popup: {
        dockEnabled: false,
        dockOptions: {
          breakpoint: false,
        },
      },
    });

    setMapView(mapView);
    setUpdateMapViewConfig(true);

    return () => {
      mapView.destroy();
    };
  }, [mapRefAvailable, webMapId, globalMapSettings.tile_provider]);

  // If the webMapId changes, reset the initialized state
  useEffect(() => {
    setInitialized(false);
  }, [webMapId]);

  // Load initial map configuration data that was passed in.
  // This will run on initial render and whenever the
  // webMapId changes
  useEffect(() => {
    if (!mapView || !updateMapViewConfig) return;

    configureMapView(
      mapView,
      initialData,
      globalMapSettings,
      isMobileOrSmaller
    );

    setUpdateMapViewConfig(false);
  }, [
    mapView,
    updateMapViewConfig,
    globalMapSettings,
    initialData,
    isMobileOrSmaller,
  ]);

  // Run onInit function once on init if it was provided
  useEffect(() => {
    if (!mapView || initialized) return;

    if (initialData?.onInit) {
      initialData.onInit(mapView);
    }

    setInitialized(true);
  }, [initialData, initialized, mapView]);

  // The following useEffects are used for handling dynamic data that is passed in.
  // Description: This data is dynamic and may change during runtime.
  useEffect(() => {
    // Add any map layers which were passed in
    if (!layers || !mapView) return;

    const isWebMap = map instanceof WebMap;
    const isRegularMap = map instanceof Map && !isWebMap;

    // If we're not using a Web Map, add the layers to the default Map object
    if (isRegularMap) {
      // Remove all layers
      map.removeAll();
      // Add layers back if passed in
      layers.forEach((layer) => {
        map.add(layer);
      });
    }

    // Otherwise add the layers into the WebMap
    if (isWebMap) {
      map.when(() => {
        // If the Web Map has any reference layers, re-order them so the layer hierarchy is correct
        if (referenceLayers && referenceLayers.length > 0) {
          handleWebMapReferenceLayers(map, referenceLayers);
        }

        // Remove any internal layers that were passed in as props to the Web Map
        map.layers.forEach((layer) => {
          if (layer.id.includes('_internal')) {
            map.remove(layer);
          }
        });

        // Now, add any additional layers that passed in as props to the Web Map
        layers.forEach((layer) => {
          layer.id = layer.id.includes('internal')
            ? layer.id
            : `${layer.id}_internal`;
          map.add(layer);
        });

        // If the WebMap has reference layers, save them in state
        setReferenceLayers(map.basemap.referenceLayers);
      });
    }
  }, [layers, map, mapView, referenceLayers]);

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
    // On map hover, pass the event to hover handler if it was provided
    if (onHover && mapView) {
      const debouncedHover = debounce((event: any) => {
        onHover(event, mapView);
      }, 60);

      mapView.on('pointer-move', debouncedHover);
    }
  }, [onHover, mapView]);

  useEffect(() => {
    // Sets the locale of the map
    setEsriLocale(locale);
  }, [locale]);

  useEffect(() => {
    const apiKey =
      appConfig?.data.attributes.settings.esri_integration?.api_key;

    // Set the Esri API key
    if (apiKey) {
      esriConfig.apiKey = apiKey;
    }
  }, [appConfig?.data.attributes.settings.esri_integration?.api_key]);

  // Handle user location
  useEffect(() => {
    if (!showUserLocation || !mapView) return;

    let currentLocationGraphic: Graphic | null = null;
    let watchId: number | null = null;

    const updateUserLocation = (position: GeolocationPosition) => {
      const { longitude, latitude } = position.coords;

      // Remove existing location graphic if it exists
      if (currentLocationGraphic) {
        mapView.graphics.remove(currentLocationGraphic);
      }

      // Create new user location graphic
      const locationGraphic = createUserLocationGraphic(longitude, latitude);
      mapView.graphics.add(locationGraphic);
      currentLocationGraphic = locationGraphic;
    };

    const handleLocationError = (error: GeolocationPositionError) => {
      console.warn('Error getting user location:', error);
    };

    if ('geolocation' in navigator) {
      // Use watchPosition for continuous location updates
      watchId = navigator.geolocation.watchPosition(
        updateUserLocation,
        handleLocationError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000, // Cache location for 30 seconds
        }
      );
    }

    // Cleanup function to remove user location graphic and stop watching
    return () => {
      if (currentLocationGraphic) {
        mapView.graphics.remove(currentLocationGraphic);
      }
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [showUserLocation, mapView]);

  return (
    <>
      <MapContainer
        id={id}
        ref={mapRef}
        width={width ? `${width}` : '100%'}
        height={height ? `${height}` : '400px'}
        basemapType={getDefaultBasemapType(globalMapSettings.tile_provider)}
        style={{
          maxHeight: height || '400px',
          overflow: 'hidden',
        }}
      />
    </>
  );
};

const EsriMapWrapper = (props: Omit<EsriMapProps, 'globalMapSettings'>) => {
  const { data: appConfig } = useAppConfiguration();
  const globalMapSettings = appConfig?.data.attributes.settings.maps;

  return (
    <>
      {globalMapSettings && (
        <EsriMap globalMapSettings={globalMapSettings} {...props} />
      )}
    </>
  );
};

export default EsriMapWrapper;
