import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import PostFeedback from './admin/containers/PostFeedback';
import Tab from './admin/components/Tab';

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
    'app.containers.Admin.dashboard.summary.postStatus': PostFeedback,
    'app.containers.Admin.dashboards.tabs': Tab,
  },
};

export default configuration;
