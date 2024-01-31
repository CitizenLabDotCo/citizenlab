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
    size: '30px',
    path: 'M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z',
    xoffset: '-12',
  };

  const pointGraphic = new Graphic({
    geometry: new Point({
      longitude: position.coordinates[0],
      latitude: position.coordinates[1],
    }),
    symbol: simpleMarkerSymbol,
  });

  return (
    <EsriMap
      center={position}
      height={mapHeight}
      zoom={18}
      graphics={[pointGraphic]}
    />
  );
});

export default MapComponent;
