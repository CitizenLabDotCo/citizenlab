import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';

const PostFeedback = React.lazy(
  () => import('./admin/containers/PostFeedback')
);
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
