import React, { memo } from 'react';
import Map from 'components/Map';

export interface Props {
  position: GeoJSON.Point;
  projectId?: string | null;
}

const MapComponent = memo<Props>(({ position, projectId }) => {
  const points: any = [{ ...position }];
  const center = position.coordinates;
  const centerCoordinates = [center[1], center[0]];

  return (
    <Map
      points={points}
      centerCoordinates={centerCoordinates}
      projectId={projectId}
      mapHeight="400px"
    />
  );
});

export default MapComponent;
