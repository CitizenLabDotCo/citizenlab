import React, { memo } from 'react';
import styled from 'styled-components';

// components
import { Icon, colors } from 'cl2-component-library';
// const Map = React.lazy(() => import('./Map'));

const StyledIcon = styled(Icon)`
  width: 15px;
  height: 21px;
  fill: ${colors.label}
`;

export interface Props {
  // address: string;
  // position: GeoJSON.Point;
  // className?: string;
  // projectId?: string | null;
}

const DropdownMap = memo<Props>(
  () => {
    return (
      <StyledIcon name="position" />
    );
  }
);

export default DropdownMap;
