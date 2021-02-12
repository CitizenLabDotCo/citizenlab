import React, { memo } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Map from './Map';
import LayerList from './LayerList';

// styling
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
`;

const StyledLayerList = styled(LayerList)`
  flex: 0 0 400px;
  width: 400px;
`;

const StyledMap = styled(Map)`
  flex: 1;
  height: 800px;
  margin-left: 60px;
`;

interface Props {
  className?: string;
}

const MapPage = memo<Props & WithRouterProps>(
  ({ params: { projectId }, className }) => {
    if (projectId) {
      return (
        <Container className={className || ''}>
          <StyledLayerList projectId={projectId} />
          <StyledMap projectId={projectId} />
        </Container>
      );
    }

    return null;
  }
);

export default withRouter(MapPage);
