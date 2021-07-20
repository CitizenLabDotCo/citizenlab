import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import FeatureFlag from 'components/FeatureFlag';

const configuration: ModuleConfiguration = {
  routes: {
    'admin.ideas': [
      {
        path: 'statuses',
        container: () => import('./admin/containers/'),
      },
      {
        path: 'statuses/new',
        container: () => import('./admin/containers/new'),
      },
      {
        path: 'statuses/:id',
        container: () => import('./admin/containers/edit'),
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
