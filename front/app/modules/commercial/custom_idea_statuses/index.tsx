import React from 'react';

import { AdminRoute } from 'containers/Admin/routes';

import { ModuleConfiguration } from 'utils/moduleUtils';
const Tab = React.lazy(() => import('./admin/components/Tab'));
const FeatureFlag = React.lazy(() => import('components/FeatureFlag'));

const StatusesComponent = React.lazy(() => import('./admin/containers/'));
const NewStatusComponent = React.lazy(() => import('./admin/containers/new'));
const StatusShowComponent = React.lazy(() => import('./admin/containers/edit'));

export enum customIdeaStatusesRoutes {
  statuses = 'statuses',
  new = 'statuses/new',
  id = `statuses/:id`,
}

// TODO: Replace "settings" with link to route in main app once converted.
export type customIdeaStatusesRouteTypes =
  | AdminRoute<`settings/${customIdeaStatusesRoutes.statuses}`>
  | AdminRoute<`settings/${customIdeaStatusesRoutes.statuses}/${customIdeaStatusesRoutes.new}`>
  | AdminRoute<`settings/${customIdeaStatusesRoutes.statuses}/${string}`>;

const configuration: ModuleConfiguration = {
  routes: {
    'admin.settings': [
      {
        path: customIdeaStatusesRoutes.statuses,
        element: <StatusesComponent />,
      },
      {
        path: customIdeaStatusesRoutes.new,
        element: <NewStatusComponent />,
      },
      {
        path: customIdeaStatusesRoutes.id,
        element: <StatusShowComponent />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.settings.tabs': (props) => {
      return (
        <FeatureFlag name="custom_idea_statuses">
          <Tab {...props} />
        </FeatureFlag>
      );
    },
  },
};

export default configuration;
