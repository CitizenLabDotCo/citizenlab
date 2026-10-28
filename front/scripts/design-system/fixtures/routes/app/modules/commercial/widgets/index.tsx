import React from 'react';

const AdminWidgets = React.lazy(() => import('./admin/Widgets'));
const CitizenWidgets = React.lazy(() => import('./admin/Widgets'));

const configuration = {
  routes: {
    'admin.tools': [{ path: 'widgets', element: <AdminWidgets /> }],
    citizen: [{ path: 'widgets/:widgetId', element: <CitizenWidgets /> }],
  },
};

export default configuration;
