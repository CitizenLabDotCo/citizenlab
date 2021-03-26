import React, { memo } from 'react';

// components
import CollapsibleBox from 'components/UI/CollapsibleBox';
const Map = React.lazy(() => import('./Map'));

export interface Props {
  address: string;
  position: GeoJSON.Point;
  className?: string;
  projectId?: string | null;
}

const DropdownMap = memo<Props>(
  ({ address, position, className, projectId }) => {
    return (
      <CollapsibleBox
        e2eId="e2e-map-toggle"
        className={className}
        titleIconName="position"
        title={address}
      >
        <Map position={position} projectId={projectId} />
      </CollapsibleBox>
    );
  }
);

export default DropdownMap;
