import React, { memo, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

// components
import Map from './Map';
import LayerList from './LayerList';

// hooks
import useMapConfig from 'hooks/useMapConfig';

// events
import { updateLayers } from './events';

// styling
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
`;

const StyledLayerList = styled(LayerList)`
  flex: 0 0 500px;
  width: 500px;
`;

const StyledMap = styled(Map)`
  flex: 0 0 500px;
  width: 500px;
  height: 500px;
  margin-left: 60px;
`;

interface Props {
  className?: string;
}

const MapPage = memo<Props & WithRouterProps>(
  ({ params: { projectId }, className }) => {
    const mapConfig = useMapConfig({ projectId, prefetchMapLayers: true });

    useEffect(() => {
      return () => {
        updateLayers([]);
      };
    }, []);

    useEffect(() => {
      updateLayers(
        !isNilOrError(mapConfig) && mapConfig?.attributes?.layers?.length > 0
          ? mapConfig.attributes.layers
          : []
      );
    }, [mapConfig]);

    if (projectId) {
      return (
        <Container className={className || ''}>
          <StyledLayerList projectId={projectId} />
          <StyledMap />
        </Container>
      );
    }

    return null;
  }
);

export default withRouter(MapPage);
