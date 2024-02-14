import React, { memo, useMemo } from 'react';

// components
import EsriMap from 'components/EsriMap';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol.js';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer.js';
import MapView from '@arcgis/core/views/MapView';
import LayerHoverLabel from './LayerHoverLabel';
import MapHelperOptions from './MapHelperOptions';

// hooks
import useLocalize from 'hooks/useLocalize';

// style
import { Box, colors } from '@citizenlab/cl2-component-library';

// utils
import debounceFn from 'lodash/debounce';
import {
  getMakiSymbolFromPath,
  getMapPinSymbol,
} from 'components/EsriMap/utils';
import { hexToRGBA } from 'utils/helperUtils';

// types
import { IMapConfig } from 'modules/commercial/custom_maps/api/map_config/types';

export interface Props {
  mapConfig: IMapConfig;
  projectId: string;
}

const IdeationConfigurationMap = memo<Props>(
  ({ mapConfig, projectId }: Props) => {
    const localize = useLocalize();
    const [mapView, setMapView] = React.useState<MapView | null>(null);
    const [hoveredLayerId, setHoveredLayerId] = React.useState<string | null>(
      null
    );

    // Create GeoJSON layers to add to Esri map
    const geoJsonLayers = useMemo(() => {
      return mapConfig.data.attributes.layers.map((layer) => {
        // create a new blob from geojson featurecollection
        const blob = new Blob([JSON.stringify(layer.geojson)], {
          type: 'application/json',
        });

        // URL reference to the blob
        const url = URL.createObjectURL(blob);

        // create new geojson layer using the created url
        const geoJsonLayer = new GeoJSONLayer({
          url,
          customParameters: {
            layerId: layer.id,
          },
        });

        const geometryType = layer.geojson?.features[0].geometry?.type;

        if (geometryType === 'Polygon') {
          // All features in a layer will have the same symbology, so we can just check the first feature's properties
          const fillColour = layer.geojson?.features[0]?.properties?.fill;
          geoJsonLayer.renderer = new SimpleRenderer({
            symbol: new SimpleFillSymbol({
              color: fillColour
                ? hexToRGBA(fillColour, 0.3)
                : hexToRGBA(colors.coolGrey600, 0.3),
              outline: {
                color: fillColour,
                width: 2,
              },
            }),
          });
        } else if (geometryType === 'Point') {
          // Get color and icon name
          const pointColour = layer.geojson?.features[0]?.properties?.fill;
          const pointSymbol =
            layer.geojson?.features[0]?.properties?.['marker-symbol'];

          // Generate the symbol
          if (pointSymbol) {
            // Use a custom Maki symbol
            getMakiSymbolFromPath(pointSymbol, pointColour).then((symbol) => {
              geoJsonLayer.renderer = new SimpleRenderer({
                symbol,
              });
            });
          } else {
            // Use the default map pin symbol
            geoJsonLayer.renderer = new SimpleRenderer({
              symbol: getMapPinSymbol({
                color: pointColour || colors.coolGrey600,
              }),
            });
          }
        }
        // Specify the legend title
        geoJsonLayer.title = localize(layer.title_multiloc);

        return geoJsonLayer;
      });
    }, [mapConfig, localize]);

    const onHover = debounceFn((event: any, esriMapView: MapView) => {
      // Save the esriMapView in state
      if (!mapView) {
        setMapView(esriMapView);
      }

      esriMapView.hitTest(event).then((result) => {
        if (result.results.length > 0) {
          // Hovering over marker(s)
          const element = result.results[0];
          if (element.type === 'graphic') {
            // Change cursor to pointer
            document.body.style.cursor = 'pointer';
            // Set the hovered layer id
            setHoveredLayerId(element.layer['customParameters']?.layerId);
          }
        } else {
          document.body.style.cursor = 'auto';
          setHoveredLayerId(null);
        }
      });
    }, 10);

    return (
      <Box>
        <EsriMap
          initialData={{
            center: mapConfig.data.attributes.center_geojson,
            zoom: Number(mapConfig.data.attributes.zoom_level),
            showLayerVisibilityControl: true,
            showLegend: true,
          }}
          height={'700px'}
          layers={geoJsonLayers}
          onHover={onHover}
        />
        <LayerHoverLabel
          layer={mapConfig.data.attributes.layers.find(
            (layer) => layer?.id === hoveredLayerId
          )}
        />
        <MapHelperOptions
          mapView={mapView}
          mapConfig={mapConfig}
          projectId={projectId}
        />
      </Box>
    );
  }
);

export default IdeationConfigurationMap;
