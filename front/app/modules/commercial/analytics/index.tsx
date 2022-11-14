import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const InputStatusCard = React.lazy(
  () => import('./admin/components/InputStatusCard')
);

const Tab = React.lazy(() => import('./admin/components/Tab'));
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
    'app.containers.Admin.dashboard.summary.inputStatus': InputStatusCard,
    'app.containers.Admin.dashboards.tabs': Tab,
  },
};

export default configuration;
