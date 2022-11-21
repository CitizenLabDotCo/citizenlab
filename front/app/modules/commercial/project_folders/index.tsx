import React, { lazy } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const ProjectFolderModerationRightsReceivedNotification = React.lazy(
  () =>
    import(
      './citizen/components/ProjectFolderModerationRightsReceivedNotification'
    )
);
const ProjectFolderGoBackButton = React.lazy(
  () => import('./citizen/components/ProjectFolderGoBackButton')
);
import { IProjectFolderModerationRightsReceivedNotificationData } from 'services/notifications';
import { RenderOnNotificationTypeProps } from 'modules/utilComponents/RenderOnNotificationType';
const FeatureFlag = React.lazy(() => import('components/FeatureFlag'));
import { Navigate } from 'react-router-dom';
const FolderShowPage = lazy(
  () => import('./citizen/containers/ProjectFolderShowPage')
);
const FolderSettings = lazy(() => import('./admin/containers/settings'));
const FolderContainer = lazy(() => import('./admin/containers'));
const FolderProjects = lazy(() => import('./admin/containers/projects'));
const FolderPermissions = lazy(() => import('./admin/containers/permissions'));

const RenderOnNotificationType = ({
  children,
  notification,
  notificationType,
}: RenderOnNotificationTypeProps) => {
  if (notification.attributes.type === notificationType) {
    return <>{children}</>;
  }

  return null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.NotificationMenu.Notification': ({ notification }) => (
      <FeatureFlag name="project_folders">
        <RenderOnNotificationType
          notification={notification}
          notificationType="project_folder_moderation_rights_received"
        >
          <ProjectFolderModerationRightsReceivedNotification
            notification={
              notification as IProjectFolderModerationRightsReceivedNotificationData
            }
          />
        </RenderOnNotificationType>
      </FeatureFlag>
    ),
    'app.containers.ProjectsShowPage.shared.header.ProjectHeader.GoBackButton':
      (props) => (
        <FeatureFlag name="project_folders">
          <ProjectFolderGoBackButton {...props} />
        </FeatureFlag>
      ),
  },
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
