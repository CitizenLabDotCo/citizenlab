import React, { memo, useMemo } from 'react';

// components
import EsriMap from 'components/EsriMap';
import MapView from '@arcgis/core/views/MapView';
import LayerHoverLabel from './LayerHoverLabel';
import MapHelperOptions from './MapHelperOptions';

// hooks
import useLocalize from 'hooks/useLocalize';

// style
import { Box } from '@citizenlab/cl2-component-library';

// utils
import debounceFn from 'lodash/debounce';
import { createEsriGeoJsonLayers } from 'components/EsriMap/utils';

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
      return createEsriGeoJsonLayers(
        mapConfig.data.attributes.layers,
        localize
      );
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
