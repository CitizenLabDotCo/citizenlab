import React, { memo } from 'react';
// import { LatLngTuple } from 'leaflet';

export interface Props {
  position: GeoJSON.Point;
  projectId?: string | null;
}

const MapComponent = memo<Props>(({ position, projectId }) => {
  // const points: any = [{ ...position }];
  // const center = position.coordinates;
  // const centerLatLng = [center[1], center[0]] as LatLngTuple;
  console.log({ projectId, position });
  return <h1>TODO: Implement Map component with Esri</h1>;
});

export default MapComponent;
