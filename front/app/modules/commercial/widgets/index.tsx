import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import GuideArticle from './admin/components/GuideArticle';
import Tab from './admin/components/Tab';
import FeatureFlag from 'components/FeatureFlag';

const configuration: ModuleConfiguration = {
  routes: {
    'admin.settings': [
      {
        path: 'widgets',
        name: 'widgets',
        container: () => import('./admin/containers'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.guide.SetupSection': () => (
      <FeatureFlag name="widgets">
        <GuideArticle />
      </FeatureFlag>
    ),
    'app.containers.Admin.settings.tabs': (props) => <Tab {...props} />,
  },
};

export default configuration;
