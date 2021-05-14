import React, { memo } from 'react';
import Map from 'components/Map';
import { LatLngTuple } from 'leaflet';

export interface Props {
  position: GeoJSON.Point;
  projectId?: string | null;
}

const MapComponent = memo<Props>(({ position, projectId }) => {
  const points: any = [{ ...position }];
  const center = position.coordinates;
  const centerLatLng = [center[1], center[0]] as LatLngTuple;

  return (
    <Map
      points={points}
      centerLatLng={centerLatLng}
      projectId={projectId}
      mapHeight="400px"
    />
  );
});

export default MapComponent;
