import React from 'react';

import {
  Outlet as RouterOutlet,
  useLocation,
  useParams,
} from 'react-router-dom';

import NavigationTabs from 'components/admin/NavigationTabs';
import Tab from 'components/admin/NavigationTabs/Tab';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import ProjectHeader from './projectHeader';

const AdminProjectsProjectIndex = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { projectId } = useParams() as { projectId: string };
  return (
    <>
      <ProjectHeader projectId={projectId} />
      <NavigationTabs position="relative">
        <Tab
          label={formatMessage(messages.timelineTab)}
          url={`/admin/projects/${projectId}/phases/setup`}
          active={pathname.includes(`/admin/projects/${projectId}/phases`)}
        />
        <Tab
          label={formatMessage(messages.participationTab)}
          url={`/admin/projects/${projectId}/participation`}
          active={pathname.includes(
            `/admin/projects/${projectId}/participation`
          )}
        />
        <Tab
          label={formatMessage(messages.trafficTab)}
          url={`/admin/projects/${projectId}/traffic`}
          active={pathname.includes(`/admin/projects/${projectId}/traffic`)}
        />
        <Tab
          label={formatMessage(messages.messagingTab)}
          url={`/admin/projects/${projectId}/messaging`}
          active={pathname.includes(`/admin/projects/${projectId}/messaging`)}
        />
        <Tab
          label={formatMessage(messages.eventsTab)}
          url={`/admin/projects/${projectId}/events`}
          active={pathname.includes(`/admin/projects/${projectId}/events`)}
        />
      </NavigationTabs>
      <RouterOutlet />
    </>
  );
};

export default AdminProjectsProjectIndex;
