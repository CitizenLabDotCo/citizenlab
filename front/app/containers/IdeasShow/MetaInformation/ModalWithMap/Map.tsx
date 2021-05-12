import React, { memo } from 'react';
import Map from 'components/Map';
import { LatLngTuple } from 'leaflet';

export interface Props {
  position: GeoJSON.Point;
  projectId: string;
}

const MapComponent = memo<Props>(({ position, projectId }) => {
  const points: any = [{ ...position }];
  const center = position.coordinates;
  const centerCoordinates = [center[1], center[0]] as LatLngTuple;

  return (
    <Map
      projectId={projectId}
      points={points}
      centerCoordinates={centerCoordinates}
      zoomLevel={15}
    />
  );
});

export default MapComponent;
