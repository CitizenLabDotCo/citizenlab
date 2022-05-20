import React from 'react';
import { LoadingComponent } from 'routes';
import moduleConfiguration from 'modules';

const AdminIdeasContainerComponent = React.lazy(() => import('./index'));
const AdminIdeasAllComponent = React.lazy(() => import('./all'));

export default () => ({
  path: 'ideas',
  element: (
    <LoadingComponent>
      <AdminIdeasContainerComponent />
    </LoadingComponent>
  ),
  children: [
    {
      index: true,
      element: (
        <LoadingComponent>
          <AdminIdeasAllComponent />
        </LoadingComponent>
      ),
    },
    ...moduleConfiguration.routes['admin.ideas'],
  ],
});
