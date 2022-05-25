import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import { isNilOrError } from 'utils/helperUtils';

import NewProjectFolderButton from './admin/components/NewProjectFolderButton';
import ProjectFolderRow from './admin/components/ProjectFolderRow';
import ProjectFolderTitle from './admin/components/ProjectFolderTitle';
import ProjectFolderSelect from './admin/components/ProjectFolderSelect';

import ProjectFolderCard from './citizen/components/ProjectFolderCard';
import ProjectFolderSiteMap from './citizen/components/ProjectFolderSiteMap';
import ProjectFolderModerationRightsReceivedNotification from './citizen/components/ProjectFolderModerationRightsReceivedNotification';
import CreateProject from 'containers/Admin/projects/all/CreateProject';
import ProjectFolderGoBackButton from './citizen/components/ProjectFolderGoBackButton';

import ProjectsListItem from 'containers/MainHeader/ProjectsListItem';

import { isProjectFolderModerator } from './permissions/roles';
import useAuthUser from 'hooks/useAuthUser';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { IProjectFolderModerationRightsReceivedNotificationData } from 'services/notifications';
import { AdminPublicationType } from 'services/adminPublications';
import { RenderOnNotificationTypeProps } from 'modules/utilComponents/RenderOnNotificationType';
import FeatureFlag from 'components/FeatureFlag';

const FolderShowPageComponent = React.lazy(
  () => import('./citizen/containers/ProjectFolderShowPage')
);
const FolderSettingsComponent = React.lazy(
  () => import('./admin/containers/settings')
);
const FolderContainerComponent = React.lazy(() => import('./admin/containers'));
const FolderProjectsComponent = React.lazy(
  () => import('./admin/containers/projects')
);
const FolderPermissionsComponent = React.lazy(
  () => import('./admin/containers/permissions')
);

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
        element: <FolderShowPageComponent />,
      },
    ],
    admin: [
      {
        path: 'projects/folders/new',
        element: <FolderSettingsComponent />,
      },
      {
        path: 'projects/folders/:projectFolderId',
        element: <FolderContainerComponent />,
        children: [
          {
            path: '',
            element: <FolderProjectsComponent />,
          },
          {
            path: 'settings',
            element: <FolderSettingsComponent />,
          },
          {
            path: 'permissions',
            element: <FolderPermissionsComponent />,
          },
        ],
      },
    ],
  },
};

export default configuration;
