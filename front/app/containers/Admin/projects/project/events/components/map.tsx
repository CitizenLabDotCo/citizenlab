import React, { memo } from 'react';
import { LatLngTuple } from 'leaflet';
import Map from 'components/Map';
import styled from 'styled-components';

export interface Props {
  position: GeoJSON.Point;
  projectId?: string | null;
}

const StyledMap = styled(Map)`
  .leaflet-container {
    cursor: pointer !important;
  }
`;

const MapComponent = memo<Props>(({ position, projectId }) => {
  const points: any = [{ ...position }];
  const center = position.coordinates;
  const centerLatLng = [center[1], center[0]] as LatLngTuple;

  return (
    <StyledMap
      points={points}
      centerLatLng={centerLatLng}
      projectId={projectId}
      mapHeight="300px"
      noMarkerClustering={false}
      zoomLevel={20}
    />
  );
});

export default MapComponent;
