import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
import PageLoading from 'components/UI/PageLoading';

const ToolsWrapper = lazy(() => import('.'));
const Tools = lazy(() => import('./Tools'));

const toolsRoutes = () => {
  console.log(
    "moduleConfiguration.routes['admin.tools']",
    moduleConfiguration.routes['admin.tools']
  );
  return {
    path: 'tools',
    element: (
      <PageLoading>
        <ToolsWrapper />
      </PageLoading>
    ),
    children: [
      {
        path: '',
        element: (
          <PageLoading>
            <Tools />
          </PageLoading>
        ),
      },
      ...moduleConfiguration.routes['admin.tools'],
    ],
  };
};

export default toolsRoutes;
