import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const ReportBuilder = React.lazy(() => import('./admin/containers/index'));

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'report-builder',
        element: <ReportBuilder />,
      },
    ],
  },
};

export default configuration;
