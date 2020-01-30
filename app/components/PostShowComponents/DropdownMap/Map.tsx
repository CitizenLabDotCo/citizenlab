import React, { memo } from 'react';
import Map from 'components/Map';

// styling
import styled from 'styled-components';

const MapWrapperInner = styled.div`
  height: 265px;
`;

export interface Props {
  position: GeoJSON.Point;
}

const MapComponent = memo(({ position }: Props) => {
  const points: any = [{ ...position }];
  const center = position.coordinates;

  return (
    <MapWrapperInner>
      <Map
        points={points}
        center={center}
      />
    </MapWrapperInner>
  );
});

export default MapComponent;
