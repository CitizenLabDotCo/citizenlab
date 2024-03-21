import React from 'react';

import { AdminRoute } from 'containers/Admin/routes';

import { ModuleConfiguration } from 'utils/moduleUtils';
const Tab = React.lazy(() => import('./admin/components/Tab'));
const FeatureFlag = React.lazy(() => import('components/FeatureFlag'));

const ImportComponent = React.lazy(() => import('./admin/containers/Import'));

export enum bulkIdeaImportRoutes {
  import = 'import',
}

// TODO: Replace "ideas" with link to route in main app once converted.
export type bulkIdeaImportRouteTypes = AdminRoute<'ideas/import'>;

const configuration: ModuleConfiguration = {
  routes: {
    'admin.ideas': [
      {
        path: bulkIdeaImportRoutes.import,
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
