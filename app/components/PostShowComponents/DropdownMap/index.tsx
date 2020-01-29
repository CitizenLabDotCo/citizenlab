import React, { memo } from 'react';

// components
import Map from 'components/Map';
import CollapsibleBox from 'components/UI/CollapsibleBox';

// styling
import styled from 'styled-components';

const MapWrapperInner = styled.div`
  height: 265px;
`;

export interface Props {
  address: string;
  position: GeoJSON.Point;
  className?: string;
}

const DropdownMap = memo(({ address, position, className }: Props) => {
  const points: any = [{ ...position }];
  const center = position.coordinates;

  return (
    <CollapsibleBox
      className={className}
      titleIconName="position"
      title={address}
      content={
        <MapWrapperInner>
          <Map
            points={points}
            center={center}
          />
        </MapWrapperInner>
      }
    />
  );
});

export default DropdownMap;
