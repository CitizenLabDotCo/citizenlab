import React, { memo } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
// import { isNilOrError } from 'utils/helperUtils';

// components
import Map from './Map';
import LayerList from './LayerList';

// hooks
// import useMapConfig from 'hooks/useMapConfig';

// events
// import { setLayers } from './events';

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
    // const mapConfig = useMapConfig({ projectId, prefetchMapLayers: true });

    // useEffect(() => {
    //   return () => {
    //     setLayers([]);
    //   };
    // }, []);

    // useEffect(() => {
    //   setLayers(
    //     !isNilOrError(mapConfig) && mapConfig?.attributes?.layers?.length > 0
    //       ? mapConfig.attributes.layers
    //       : []
    //   );
    // }, [mapConfig]);

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
