import React, { memo } from 'react';
import Map from 'components/Map';

export interface Props {
  position: GeoJSON.Point;
  projectId: string;
}

const MapComponent = memo<Props>(({ position, projectId }) => {
  const points: any = [{ ...position }];
  const center = position.coordinates;
  const centerCoordinates = [center[1], center[0]];

  return (
    <Map
      projectId={projectId}
      points={points}
      centerCoordinates={centerCoordinates}
      zoom={15}
    />
  );
});

export default MapComponent;
