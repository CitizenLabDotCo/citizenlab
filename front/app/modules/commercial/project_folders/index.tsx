import React, { lazy } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

import { Navigate } from 'react-router-dom';
const FolderShowPage = lazy(
  () => import('./citizen/containers/ProjectFolderShowPage')
);
const FolderSettings = lazy(() => import('./admin/containers/settings'));
const FolderContainer = lazy(() => import('./admin/containers'));
const FolderProjects = lazy(() => import('./admin/containers/projects'));
const FolderPermissions = lazy(() => import('./admin/containers/permissions'));

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
