import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const InputStatusCard = React.lazy(
  () => import('./admin/components/InputStatusCard')
);

const Tab = React.lazy(() => import('./admin/components/Tab'));
const VisitorsContainer = React.lazy(
  () => import('./admin/containers/Visitors')
);
const Proposals = React.lazy(() => import('./admin/containers/Proposals'));
const Invitations = React.lazy(() => import('./admin/containers/Invitations'));
const Events = React.lazy(() => import('./admin/containers/Events'));
const ProjectStatus = React.lazy(
  () => import('./admin/containers/ProjectStatus')
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
    'app.containers.Admin.dashboard.summary.proposals': Proposals,
    'app.containers.Admin.dashboard.summary.invitations': Invitations,
    'app.containers.Admin.dashboard.summary.events': Events,
    'app.containers.Admin.dashboard.summary.projectStatus': ProjectStatus,
  },
};

export default configuration;
