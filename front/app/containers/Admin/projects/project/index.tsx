import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';
import { IProjectData } from 'api/projects/types';

import NavigationTabs from 'components/admin/NavigationTabs';
import NewLabel from 'components/UI/NewLabel';
import Tab from 'components/admin/NavigationTabs/Tab';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { Outlet as RouterOutlet, useLocation, useParams } from 'utils/router';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';
import { useIntl } from 'utils/cl-intl';

import ProjectHeader from './projectHeader';
import ProjectSidebar from './newBackoffice/ProjectSidebar';
import messages from './messages';
import useParallelParticipation from 'hooks/useParallelParticipation';

const AdminProjectsProjectIndex = ({ project }: { project: IProjectData }) => {
  const { formatMessage } = useIntl();

  const { pathname } = useLocation();

  const { data: appConfiguration } = useAppConfiguration();

  const { data: authUser } = useAuthUser();

  const projectStaticPagesEnabled = useFeatureFlag({
    name: 'project_static_pages',
  });

  const privateAttributesInExport =
    appConfiguration?.data.attributes.settings.core
      .private_attributes_in_export !== false;

  if (newBackoffice) {
    return (
      <Box
        data-cy="e2e-admin-projects-project-index"
        display="flex"
        flexDirection="column"
        height="100vh"
        overflow="hidden"
      >
        <ProjectHeader projectId={projectId} />
        <Box display="flex" flexGrow={1} minHeight="0" overflow="hidden">
          <ProjectSidebar projectId={projectId} />
          <Box flexGrow={1} minWidth="0" overflowY="auto">
            <RouterOutlet />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      data-cy="e2e-admin-projects-project-index"
      display="flex"
      flexDirection="column"
      flexGrow={1}
    >
      <ProjectHeader projectId={projectId} />
      <NavigationTabs
        position="relative"
        className="intercom-admin-project-level-settings"
      >
        <Tab
          className="intercom-admin-project-general-tab"
          label={formatMessage(messages.generalTab)}
          url={`/admin/projects/${projectId}/general`}
          active={pathname.includes(`/admin/projects/${projectId}/general`)}
        />
        <Tab
          data-cy="e2e-admin-project-timeline-tab"
          className="intercom-admin-project-timeline-tab"
          label={formatMessage(messages.timelineTab)}
          url={`/admin/projects/${projectId}/phases/setup`}
          active={pathname.includes(`/admin/projects/${projectId}/phases`)}
        />
        <Tab
          className="intercom-admin-project-participants-tab"
          label={formatMessage(messages.audienceTab)}
          url={
            privateAttributesInExport
              ? `/admin/projects/${projectId}/audience`
              : `/admin/projects/${projectId}/audience/demographics`
          }
          active={pathname.includes(`/admin/projects/${projectId}/audience`)}
        />
        <Tab
          className="intercom-admin-project-messaging-tab"
          label={formatMessage(messages.messagingTab)}
          url={`/admin/projects/${projectId}/messaging`}
          active={pathname.includes(`/admin/projects/${projectId}/messaging`)}
        />
        <Tab
          className="intercom-admin-project-events-tab"
          label={formatMessage(messages.eventsTab)}
          url={`/admin/projects/${projectId}/events`}
          active={pathname.includes(`/admin/projects/${projectId}/events`)}
        />
        <Tab
          className="intercom-admin-project-files-tab"
          label={
            <Box display="flex" alignItems="center" gap="8px">
              {formatMessage(messages.filesTab)}
              <NewLabel />
            </Box>
          }
          url={`/admin/projects/${projectId}/files`}
          active={pathname.includes(`/admin/projects/${projectId}/files`)}
        />
        {projectStaticPagesEnabled && (
          <Tab
            className="intercom-admin-project-pages-tab"
            label={
              <Box display="flex" alignItems="center" gap="8px">
                {formatMessage(messages.pagesTab)}
                <NewLabel />
              </Box>
            }
            url={`/admin/projects/${projectId}/pages`}
            active={pathname.includes(`/admin/projects/${projectId}/pages`)}
          />
        )}
      </NavigationTabs>
      <RouterOutlet />
    </Box>

  );

  const newBackoffice = useParallelParticipation();
};

const AdminProjectsProjectIndexWrapper = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: project } = useProjectById(projectId);

  if (!project) return null;

  return <AdminProjectsProjectIndex project={project.data} />;
};

export default AdminProjectsProjectIndexWrapper;
