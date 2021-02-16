import React, { memo } from 'react';
import Map from 'components/Map';
import styled from 'styled-components';

const StyledMap = styled(Map)`
  height: 400px;
`;

export interface Props {
  position: GeoJSON.Point;
  projectId?: string | null;
}

const MapComponent = memo<Props>(({ position, projectId }) => {
  const points: any = [{ ...position }];
  const center = position.coordinates;

  return (
    <StyledMap
      points={points}
      centerCoordinates={center}
      projectId={projectId}
    />
  );
});

export default MapComponent;
