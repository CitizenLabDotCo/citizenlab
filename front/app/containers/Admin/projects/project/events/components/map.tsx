import React, { memo } from 'react';

// components
import Map from 'components/Map';

// styles
import styled from 'styled-components';

// types
import { LatLngTuple } from 'leaflet';

export interface Props {
  position: GeoJSON.Point;
  projectId?: string | null;
  mapHeight?: string;
  hideLegend?: boolean;
  singleClickEnabled?: boolean;
}

const StyledMap = styled(Map)`
  .leaflet-container {
    cursor: pointer !important;
    interactive: false !important;
  }
`;

const MapComponent = memo<Props>(
  ({ position, projectId, mapHeight, hideLegend, singleClickEnabled }) => {
    const center = position.coordinates;
    const centerLatLng = [center[1], center[0]] as LatLngTuple;

    return (
      <StyledMap
        points={[{ ...position, id: 'markerPosition' }]}
        centerLatLng={centerLatLng}
        projectId={projectId}
        mapHeight={mapHeight ? mapHeight : '600px'}
        noMarkerClustering={false}
        zoomLevel={20}
        hideLegend={hideLegend}
        singleClickEnabled={singleClickEnabled}
      />
    );
  }
);

export default MapComponent;
