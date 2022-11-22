import React, { lazy } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

import { Navigate } from 'react-router-dom';
const FolderShowPage = lazy(() => import('containers/ProjectFolderShowPage'));
const FolderSettings = lazy(
  () => import('../../../containers/Admin/projectFolders/containers/settings')
);
const FolderContainer = lazy(
  () => import('../../../containers/Admin/projectFolders/containers')
);
const FolderProjects = lazy(
  () => import('../../../containers/Admin/projectFolders/containers/projects')
);
const FolderPermissions = lazy(
  () =>
    import('../../../containers/Admin/projectFolders/containers/permissions')
);

const configuration: ModuleConfiguration = {
  routes: {
    citizen: [
      {
        path: 'folders/:slug',
        element: <FolderShowPage />,
      },
    ],
    ['admin.projects']: [
      {
        path: 'folders/new',
        element: <FolderSettings />,
      },
      {
        path: 'folders/:projectFolderId',
        element: <FolderContainer />,
        children: [
          {
            path: '',
            element: <Navigate to="projects" />,
          },
          {
            path: 'projects',
            element: <FolderProjects />,
          },
          {
            path: 'settings',
            element: <FolderSettings />,
          },
          {
            path: 'permissions',
            element: <FolderPermissions />,
          },
        ],
      },
    ],
  },
};

export default configuration;
