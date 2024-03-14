import React, { memo, useMemo } from 'react';

import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import { useTheme } from 'styled-components';

import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import { getMapPinSymbol, parseLayers } from 'components/EsriMap/utils';

export interface Props {
  position: GeoJSON.Point;
  projectId?: string | null;
}

const MapComponent = memo<Props>(({ position, projectId }) => {
  const { data: mapConfig } = useProjectMapConfig(projectId || undefined);
  const localize = useLocalize();
  const theme = useTheme();
  const center = position.coordinates;

  // Load layers from project
  // Create Esri layers to add to map
  const layers = useMemo(() => {
    return parseLayers(mapConfig, localize);
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
