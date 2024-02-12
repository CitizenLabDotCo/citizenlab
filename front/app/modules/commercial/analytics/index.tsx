import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const InputStatusCard = React.lazy(
  () => import('./admin/components/InputStatusCard')
);

const EmailDeliveriesCard = React.lazy(
  () => import('./admin/components/EmailDeliveriesCard')
);

const VisitorsContainer = React.lazy(
  () => import('./admin/containers/Visitors')
);
const ProposalsCard = React.lazy(
  () => import('./admin/components/ProposalsCard')
);
const InvitationsCard = React.lazy(
  () => import('./admin/components/InvitationsCard')
);
const EventsCard = React.lazy(() => import('./admin/components/EventsCard'));
const ProjectStatusCard = React.lazy(
  () => import('./admin/components/ProjectStatusCard')
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
    'app.containers.Admin.dashboard.summary.emailDeliveries':
      EmailDeliveriesCard,
    'app.containers.Admin.dashboard.summary.proposals': ProposalsCard,
    'app.containers.Admin.dashboard.summary.invitations': InvitationsCard,
    'app.containers.Admin.dashboard.summary.events': EventsCard,
    'app.containers.Admin.dashboard.summary.projectStatus': ProjectStatusCard,
  },
};

export default configuration;
