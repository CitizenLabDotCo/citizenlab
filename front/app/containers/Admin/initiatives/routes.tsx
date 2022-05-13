import { lazy } from 'react';
// import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';
// import moduleConfiguration from 'modules';
const AdminInitiativesIndex = lazy(() => import('.'));
const AdminInitiativesSettings = lazy(() => import('./settings'));
const AdminInitiativesManage = lazy(() => import('./manage'));

const createAdminInitiativesRoutes = () => ({
  path: 'initiatives',
  element: AdminInitiativesIndex,
  children: [
    {
      index: true,
      path: 'settings',
      element: AdminInitiativesSettings,
    },
    {
      path: 'manage',
      element: AdminInitiativesManage,
    },
    // ...moduleConfiguration.routes['admin.initiatives'],
  ],
});

export default createAdminInitiativesRoutes;
