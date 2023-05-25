import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';

const ToolsWrapper = lazy(() => import('.'));

const reportingRoutes = () => {
  return {
    path: 'tools',
    element: (
      <PageLoading>
        <ToolsWrapper />
      </PageLoading>
    ),
  };
};

export default reportingRoutes;
