import React, { memo } from 'react';
import Map from 'components/Map';

export interface Props {
  position: GeoJSON.Point;
  projectId: string;
}

const MapComponent = memo<Props>(({ position, projectId }) => {
  const points: any = [{ ...position }];
  const center = position.coordinates;

  return (
    <Map
      points={points}
      center={center}
      mapHeight={400}
      projectId={projectId}
    />
  );
});

export default MapComponent;
