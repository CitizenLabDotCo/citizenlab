import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const Tab = React.lazy(() => import('./admin/components/Tab'));

const PostFeedback = React.lazy(
  () => import('./admin/containers/PostFeedback')
);
const VisitorsContainer = React.lazy(
  () => import('./admin/containers/Visitors')
);
const Proposals = React.lazy(() => import('./admin/containers/Proposals'));
const Invitations = React.lazy(() => import('./admin/containers/Invitations'));
const Events = React.lazy(() => import('./admin/containers/Events'));

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
    'app.containers.Admin.dashboard.summary.proposals': Proposals,
    'app.containers.Admin.dashboard.summary.invitations': Invitations,
    'app.containers.Admin.dashboard.summary.events': Events,
  },
};

export default configuration;
