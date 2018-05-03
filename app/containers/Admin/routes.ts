// These are the pages you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-pages for more information
// about the code splitting business
import loadAndRender from 'utils/loadAndRender';

import dashboardRoutes from './dashboard/routes';
import ideasRoutes from './ideas/routes';
import usersRoutes from './users/routes';
import projectsRoutes from './projects/routes';
import groupsRoutes from './groups/routes';
import settingsRoutes from './settings/routes';
import settingsAreasRoutes from './settings/areas/routes';
import customFieldRoutes from './settings/registration/CustomFields/routes';
import pagesRoutes from './pages/routes';

export default () => ({
  path: '/admin',
  name: 'Admin page',
  getComponent: loadAndRender(import('containers/Admin')),
  indexRoute: dashboardRoutes(),
  childRoutes: [
    ideasRoutes(),
    usersRoutes(),
    projectsRoutes(),
    {
      path: 'settings/registration/custom_fields',
      ...(customFieldRoutes()),
    },
    settingsRoutes(),
    settingsAreasRoutes(),
    groupsRoutes(),
    pagesRoutes(),
  ],
});
