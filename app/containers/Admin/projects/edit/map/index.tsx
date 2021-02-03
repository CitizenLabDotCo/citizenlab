import React, { memo } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import Map from './Map';

const MapPage = memo<WithRouterProps>(({ params }) => {
  const projectId = params.projectId;

  if (projectId) {
    return <Map projectId={projectId} />;
  }

  return null;
});

export default withRouter(MapPage);
