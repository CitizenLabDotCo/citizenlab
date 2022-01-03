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
      onChange,
      projectAttrs,
      authUser,
    }) => (
      <FeatureFlag name="project_folders">
        <ProjectFolderSelect
          onChange={onChange}
          projectAttrs={projectAttrs}
          authUser={authUser}
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
        name: 'Project folder page',
        container: () => import('./citizen/containers/ProjectFolderShowPage'),
      },
    ],
    admin: [
      {
        path: 'projects/folders/new',
        name: 'admin projects single project',
        container: () => import('./admin/containers/settings'),
      },
      {
        path: 'projects/folders/:projectFolderId',
        name: 'admin projects edit folder',
        container: () => import('./admin/containers'),
        indexRoute: {
          name: 'admin projects edit folder projects',
          container: () => import('./admin/containers/projects'),
        },
        childRoutes: [
          {
            path: 'settings',
            name: 'admin projects edit folder settings',
            container: () => import('./admin/containers/settings'),
          },
          {
            path: 'permissions',
            name: 'admin projects edit folder permissions',
            container: () => import('./admin/containers/permissions'),
          },
        ],
      },
    ],
  },
};

export default configuration;
