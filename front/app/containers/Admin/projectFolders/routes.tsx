import React, { lazy } from 'react';
import { Navigate, Outlet as RouterOutlet } from 'react-router-dom';
import PageLoading from 'components/UI/PageLoading';

const FolderSettings = lazy(() => import('./containers/settings'));
const FolderContainer = lazy(() => import('./containers'));
const FolderProjects = lazy(() => import('./containers/projects'));
const FolderPermissions = lazy(() => import('./containers/permissions'));

export default () => ({
  path: 'projects/folders',
  element: (
    <PageLoading>
      <RouterOutlet />
    </PageLoading>
  ),
  children: [
    {
      path: 'new',
      element: <FolderSettings />,
    },
    {
      path: ':projectFolderId',
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
});
