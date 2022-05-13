import * as React from 'react';

import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';
// import moduleConfiguration from 'modules';

const DashboardIndexComponent = React.lazy(() => import('.'));

const SummaryComponent = React.lazy(() => import('./summary'));

const UsersComponent = React.lazy(() => import('./users'));

const LoadingComponent = ({ children }) => {
  return (
    <React.Suspense fallback={LoadableLoadingAdmin}>{children}</React.Suspense>
  );
};

export default () => ({
  path: 'dashboard',
  element: (
    <LoadingComponent>
      <DashboardIndexComponent />
    </LoadingComponent>
  ),
  children: [
    {
      index: true,
      element: (
        <LoadingComponent>
          <SummaryComponent />
        </LoadingComponent>
      ),
    },
    {
      path: 'users',
      element: (
        <LoadingComponent>
          <UsersComponent />
        </LoadingComponent>
      ),
    },
    // ...moduleConfiguration.routes['admin.dashboards'],
  ],
});
