import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import { RenderOnFeatureFlag } from 'modules/utilComponents';

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
        <RenderOnFeatureFlag featureFlagName="custom_idea_statuses">
          <Tab {...props} />
        </RenderOnFeatureFlag>
      );
    },
  },
};

export default configuration;
