import React, { memo } from 'react';
import Map from 'components/Map';

// styling
import styled from 'styled-components';

const MapWrapper = styled.div`
  height: 400px;
`;

export interface Props {
  position: GeoJSON.Point;
}

const MapComponent = memo<Props>(({ position }) => {
  const points: any = [{ ...position }];
  const center = position.coordinates;

  return (
    <MapWrapper>
      <Map
        points={points}
        center={center}
      />
    </MapWrapper>
  );
});

export default MapComponent;
