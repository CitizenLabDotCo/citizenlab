import React from 'react';
import { LoadingComponent } from 'routes';
import moduleConfiguration from 'modules';

const AdminIdeasContainer = React.lazy(() => import('./index'));
const AdminIdeasAll = React.lazy(() => import('./all'));

export default () => ({
  path: 'ideas',
  element: (
    <LoadingComponent>
      <AdminIdeasContainer />
    </LoadingComponent>
  ),
  children: [
    {
      index: true,
      element: (
        <LoadingComponent>
          <AdminIdeasAll />
        </LoadingComponent>
      ),
    },
    ...moduleConfiguration.routes['admin.ideas'],
  ],
});
