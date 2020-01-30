import React, { memo } from 'react';
import Map from 'components/Map';

// styling
import styled from 'styled-components';

const MapWrapper = styled.div`
  height: 265px;
`;

export interface Props {
  position: GeoJSON.Point;
}

const MapComponent = memo(({ position }: Props) => {
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
