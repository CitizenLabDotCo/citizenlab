import React from 'react';

import {
  Outlet as RouterOutlet,
  useLocation,
  useParams,
} from 'react-router-dom';

import useFeatureFlag from 'hooks/useFeatureFlag';

import NavigationTabs from 'components/admin/NavigationTabs';
import Tab from 'components/admin/NavigationTabs/Tab';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import ProjectHeader from './projectHeader';

const AdminProjectsProjectIndex = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { projectId } = useParams() as { projectId: string };

  const isDataRepositoryEnabled = useFeatureFlag({
    name: 'data_repository',
  });

  return (
    <div data-cy="e2e-admin-projects-project-index">
      <ProjectHeader projectId={projectId} />
      <NavigationTabs position="relative">
        <Tab
          className="intercom-admin-project-timeline-tab"
          label={formatMessage(messages.timelineTab)}
          url={`/admin/projects/${projectId}/phases/setup`}
          active={pathname.includes(`/admin/projects/${projectId}/phases`)}
        />
        <Tab
          className="intercom-admin-project-participants-tab"
          label={formatMessage(messages.participationTab)}
          url={`/admin/projects/${projectId}/participation`}
          active={pathname.includes(
            `/admin/projects/${projectId}/participation`
          )}
        />
        <Tab
          className="intercom-admin-project-traffic-tab"
          label={formatMessage(messages.trafficTab)}
          url={`/admin/projects/${projectId}/traffic`}
          active={pathname.includes(`/admin/projects/${projectId}/traffic`)}
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
        {isDataRepositoryEnabled && (
          <Tab
            className="intercom-admin-project-files-tab"
            label={formatMessage(messages.filesTab)}
            url={`/admin/projects/${projectId}/files`}
            active={pathname.includes(`/admin/projects/${projectId}/files`)}
          />
        )}
      </NavigationTabs>
      <RouterOutlet />
    </div>
  );
};

export default AdminProjectsProjectIndex;
