import FeatureFlag from 'components/FeatureFlag';
import CreateProject from 'containers/Admin/projects/all/CreateProject';
import ProjectsListItem from 'containers/MainHeader/ProjectsListItem';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import useAuthUser from 'hooks/useAuthUser';
import { RenderOnNotificationTypeProps } from 'modules/utilComponents/RenderOnNotificationType';
import React, { lazy, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminPublicationType } from 'services/adminPublications';
import { IProjectFolderModerationRightsReceivedNotificationData } from 'services/notifications';
import { isNilOrError } from 'utils/helperUtils';
const NewProjectFolderButton = React.lazy(
  () => import('./admin/components/NewProjectFolderButton')
);
const ProjectFolderRow = React.lazy(
  () => import('./admin/components/ProjectFolderRow')
);
const ProjectFolderTitle = React.lazy(
  () => import('./admin/components/ProjectFolderTitle')
);
const ProjectFolderSelect = React.lazy(
  () => import('./admin/components/ProjectFolderSelect')
);
const ProjectFolderCard = React.lazy(
  () => import('./citizen/components/ProjectFolderCard')
);
const ProjectFolderSiteMap = React.lazy(
  () => import('./citizen/components/ProjectFolderSiteMap')
);
const ProjectFolderModerationRightsReceivedNotification = React.lazy(
  () =>
    import(
      './citizen/components/ProjectFolderModerationRightsReceivedNotification'
    )
);
const CreateProject = React.lazy(
  () => import('containers/Admin/projects/all/CreateProject')
);
const ProjectFolderGoBackButton = React.lazy(
  () => import('./citizen/components/ProjectFolderGoBackButton')
);
const ProjectsListItem = React.lazy(
  () => import('containers/MainHeader/ProjectsListItem')
);
import { isProjectFolderModerator } from './permissions/roles';
import useAuthUser from 'hooks/useAuthUser';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { IProjectFolderModerationRightsReceivedNotificationData } from 'services/notifications';
import { AdminPublicationType } from 'services/adminPublications';
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

type RenderOnPublicationTypeProps = {
  publication: IAdminPublicationContent;
  publicationType: AdminPublicationType;
  children: ReactNode;
};

type RenderOnProjectFolderModeratorProps = {
  children: ReactNode;
};

const RenderOnPublicationType = ({
  publication,
  publicationType,
  children,
}: RenderOnPublicationTypeProps) => {
  if (publication.publicationType !== publicationType) return null;
  return <>{children}</>;
};

const RenderOnProjectFolderModerator = ({
  children,
}: RenderOnProjectFolderModeratorProps) => {
  const authUser = useAuthUser();

  if (!isNilOrError(authUser) && isProjectFolderModerator(authUser)) {
    return <>{children}</>;
  }

  return null;
};

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

const publicationType: AdminPublicationType = 'folder';
const configuration: ModuleConfiguration = {
  afterMountApplication: () => {
    import('./permissions/rules');
  },
  outlets: {
    'app.containers.Navbar.projectlist.item': (props) => {
      const { localize, publication } = props;
      return (
        <RenderOnPublicationType
          publication={publication}
          publicationType={publicationType}
        >
          <ProjectsListItem
            to={`/folders/${publication.attributes.publication_slug}`}
            {...props}
          >
            {localize(publication.attributes.publication_title_multiloc)}
          </ProjectsListItem>
        </RenderOnPublicationType>
      );
    },
    'app.containers.AdminPage.projects.all.projectsAndFolders.title': () => (
      <FeatureFlag name="project_folders">
        <ProjectFolderTitle />
      </FeatureFlag>
    ),
    'app.containers.AdminPage.projects.all.projectsAndFolders.actions': () => (
      <FeatureFlag name="project_folders">
        <NewProjectFolderButton />
      </FeatureFlag>
    ),
    'app.containers.AdminPage.projects.all.projectsAndFolders.row': (props) => (
      <RenderOnPublicationType
        publication={props.publication}
        publicationType={publicationType}
      >
        <ProjectFolderRow {...props} />
      </RenderOnPublicationType>
    ),
    'app.components.ProjectAndFolderCards.card': (props) => (
      <RenderOnPublicationType
        publication={props.publication}
        publicationType={publicationType}
      >
        <ProjectFolderCard {...props} />
      </RenderOnPublicationType>
    ),
    'app.containers.SiteMap.ProjectsSection.listitem': ({
      adminPublication,
      ...props
    }) => (
      <RenderOnPublicationType
        publication={adminPublication}
        publicationType={publicationType}
      >
        <ProjectFolderSiteMap
          projectFolderId={adminPublication.relationships.publication.data.id}
          {...props}
        />
      </RenderOnPublicationType>
    ),
    'app.components.AdminPage.projects.form.additionalInputs.inputs': ({
      onProjectAttributesDiffChange,
      projectAttrs,
    }) => (
      <FeatureFlag name="project_folders">
        <ProjectFolderSelect
          projectAttrs={projectAttrs}
          onProjectAttributesDiffChange={onProjectAttributesDiffChange}
        />
      </FeatureFlag>
    ),
    'app.containers.AdminPage.projects.all.createProjectNotAdmin': () => (
      <FeatureFlag name="project_folders">
        <RenderOnProjectFolderModerator>
          <CreateProject />
        </RenderOnProjectFolderModerator>
      </FeatureFlag>
    ),
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
