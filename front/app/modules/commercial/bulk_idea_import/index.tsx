import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import FeatureFlag from 'components/FeatureFlag';

const ImportComponent = React.lazy(() => import('./admin/containers/Import'));

const configuration: ModuleConfiguration = {
  routes: {
    'admin.ideas': [
      {
        path: 'import',
        element: <ImportComponent />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.ideas.tabs': (props) => {
      return (
        <FeatureFlag name="bulk_import_ideas">
          <Tab {...props} />
        </FeatureFlag>
      );
    },
  },
};

export default configuration;
