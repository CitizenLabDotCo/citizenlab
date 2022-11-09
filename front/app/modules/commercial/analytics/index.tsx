import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const Tab = React.lazy(() => import('./admin/components/Tab'));

const InputStatus = React.lazy(() => import('./admin/containers/InputStatus'));
const VisitorsContainer = React.lazy(
  () => import('./admin/containers/Visitors')
);

const configuration: ModuleConfiguration = {
  routes: {
    'admin.dashboards': [
      {
        path: 'visitors',
        element: <VisitorsContainer />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.dashboard.summary.inputStatus': InputStatus,
    'app.containers.Admin.dashboards.tabs': Tab,
  },
};

export default configuration;
