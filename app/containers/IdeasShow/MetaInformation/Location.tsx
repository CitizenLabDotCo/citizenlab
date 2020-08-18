import React, { memo } from 'react';
import styled from 'styled-components';

// components
import { Icon, colors } from 'cl2-component-library';
// const Map = React.lazy(() => import('./Map'));

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  width: 15px;
  height: 21px;
  fill: ${colors.label};
  margin-right: 8px;
`;

export interface Props {
  address: string;
  // position: GeoJSON.Point;
  // className?: string;
  // projectId?: string | null;
}

const DropdownMap = memo<Props>(
  ({ address }) => {
    return (
      <Container>
        <StyledIcon name="position" />
        {address}
      </Container>
    );
  }
);

export default DropdownMap;
