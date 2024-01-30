import React, { memo } from 'react';

// components
import EsriMap from 'components/EsriMap';

// esri
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Point from '@arcgis/core/geometry/Point';
export interface Props {
  position: GeoJSON.Point;
  projectId?: string | null;
  mapHeight?: string;
  hideLegend?: boolean;
  singleClickEnabled?: boolean;
}

const MapComponent = memo<Props>(({ position, mapHeight }) => {
  // Generate a point graphic for the event location
  const simpleMarkerSymbol = {
    type: 'simple-marker',
    color: [255, 255, 255], // Orange
    outline: {
      color: [255, 255, 255], // White
      width: 1,
    },
  };

  const pointGraphic = new Graphic({
    geometry: new Point({
      longitude: position.coordinates[0],
      latitude: position.coordinates[1],
    }),
    symbol: simpleMarkerSymbol,
  });

  const graphicsLayer = new GraphicsLayer();
  graphicsLayer.add(pointGraphic);

  return (
    <EsriMap
      center={position}
      height={mapHeight}
      zoom={18}
      layers={[graphicsLayer]}
    />
  );
});

export default MapComponent;
