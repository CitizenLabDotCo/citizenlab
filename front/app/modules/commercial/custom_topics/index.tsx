import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const AdminTopicsIndexComponent = React.lazy(
  () => import('./admin/containers/TopicsSettings/all')
);
const AdminTopicsNewComponent = React.lazy(
  () => import('./admin/containers/TopicsSettings/New')
);
const AdminTopicsEditComponent = React.lazy(
  () => import('./admin/containers/TopicsSettings/Edit')
);

const configuration: ModuleConfiguration = {
  routes: {
    'admin.settings': [
      {
        path: 'topics',
        element: <AdminTopicsIndexComponent />,
      },
      {
        path: 'topics/new',
        element: <AdminTopicsNewComponent />,
      },
      {
        path: 'topics/:topicId/edit',
        element: <AdminTopicsEditComponent />,
      },
    ],
  },
};

export default configuration;
