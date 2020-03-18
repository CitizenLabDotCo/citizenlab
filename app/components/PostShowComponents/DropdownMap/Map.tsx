import React, { memo } from 'react';
import Map from 'components/Map';

export interface Props {
  position: GeoJSON.Point;
}

const MapComponent = memo<Props>(({ position }) => {
  const points: any = [{ ...position }];
  const center = position.coordinates;

  return (
    <Map
      points={points}
      center={center}
      mapHeight={400}
    />
  );
});

export default MapComponent;
