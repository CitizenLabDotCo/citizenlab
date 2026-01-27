import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import {
  Outlet as RouterOutlet,
  useLocation,
  useParams,
} from 'react-router-dom';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import NavigationTabs from 'components/admin/NavigationTabs';
import Tab from 'components/admin/NavigationTabs/Tab';
import NewLabel from 'components/UI/NewLabel';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import ProjectHeader from './projectHeader';

const AdminProjectsProjectIndex = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { projectId } = useParams() as { projectId: string };
  const { data: appConfiguration } = useAppConfiguration();

  const privateAttributesInExport =
    appConfiguration?.data.attributes.settings.core
      .private_attributes_in_export !== false;

  return (
    <Box
      data-cy="e2e-admin-projects-project-index"
      display="flex"
      flexDirection="column"
      flexGrow={1}
    >
      <ProjectHeader projectId={projectId} />
      <NavigationTabs position="relative">
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
      </NavigationTabs>
      <RouterOutlet />
    </Box>
  );
};

export default AdminProjectsProjectIndex;
