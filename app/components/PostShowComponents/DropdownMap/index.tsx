import React, { memo } from 'react';

// components
import CollapsibleBox from 'components/UI/CollapsibleBox';
const Map = React.lazy(() => import('./Map'));

export interface Props {
  address: string;
  position: GeoJSON.Point;
  className?: string;
}

const DropdownMap = memo(({ address, position, className }: Props) => {
  return (
    <CollapsibleBox
      e2eId="e2e-map-toggle"
      className={className}
      titleIconName="position"
      title={address}
      lazyLoadedContent={
        <Map position={position} />
      }
    />
  );
});

export default DropdownMap;
