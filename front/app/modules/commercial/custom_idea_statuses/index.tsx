import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const Tab = React.lazy(() => import('./admin/components/Tab'));
const FeatureFlag = React.lazy(() => import('components/FeatureFlag'));

const StatusesComponent = React.lazy(() => import('./admin/containers/'));
const NewStatusComponent = React.lazy(() => import('./admin/containers/new'));
const StatusShowComponent = React.lazy(() => import('./admin/containers/edit'));

const configuration: ModuleConfiguration = {
  routes: {
    'admin.ideas': [
      {
        path: 'statuses',
        element: <StatusesComponent />,
      },
      {
        path: 'statuses/new',
        element: <NewStatusComponent />,
      },
      {
        path: 'statuses/:id',
        element: <StatusShowComponent />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.ideas.tabs': (props) => {
      return (
        <FeatureFlag name="custom_idea_statuses">
          <Tab {...props} />
        </FeatureFlag>
      );
    },
  },
};

export default configuration;
