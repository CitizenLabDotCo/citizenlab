import EsriMap from 'components/EsriMap';
import React, { memo, useMemo } from 'react';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import {
  createEsriFeatureLayers,
  createEsriGeoJsonLayers,
  getMapPinSymbol,
} from 'components/EsriMap/utils';
import { useTheme } from 'styled-components';
import useMapConfig from 'api/map_config/useMapConfig';
import useLocalize from 'hooks/useLocalize';

export interface Props {
  position: GeoJSON.Point;
  projectId?: string | null;
}

const MapComponent = memo<Props>(({ position, projectId }) => {
  const { data: mapConfig } = useMapConfig(projectId || undefined);
  const localize = useLocalize();
  const theme = useTheme();
  const center = position.coordinates;

  // Load layers from project
  // Create Esri layers to add to map
  const layers = useMemo(() => {
    const mapConfigLayers = mapConfig?.data.attributes.layers;
    // All layers are either of type Esri or GeoJSON, so we can check just the first layer
    if (
      mapConfigLayers &&
      mapConfigLayers[0]?.type === 'CustomMaps::GeojsonLayer'
    ) {
      return createEsriGeoJsonLayers(
        mapConfig?.data.attributes.layers,
        localize
      );
    } else if (
      mapConfigLayers &&
      mapConfigLayers[0]?.type === 'CustomMaps::EsriFeatureLayer'
    ) {
      return createEsriFeatureLayers(
        mapConfig.data.attributes.layers,
        localize
      );
    }
    return [];
  }, [mapConfig, localize]);

  // Create point graphic for idea location
  const pointGraphic = new Graphic({
    geometry: new Point({
      x: center[0],
      y: center[1],
    }),
    symbol: getMapPinSymbol({ color: theme.colors.tenantPrimary }),
  });

  return (
    <EsriMap
      initialData={{
        center: {
          type: 'Point',
          coordinates: [position.coordinates[0], position.coordinates[1]],
        },
        zoom: 14,
        showLegend: true,
        showLayerVisibilityControl: true,
      }}
      graphics={[pointGraphic]}
      layers={layers}
    />
  );
});

export default MapComponent;
