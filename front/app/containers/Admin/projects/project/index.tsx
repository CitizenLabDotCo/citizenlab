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
      </NavigationTabs>
      <RouterOutlet />
    </>
  );
};

{
  /* <Tab
label={label}
url={url}
key={url}
active={isTopBarNavActive(
  `/admin/projects/${projectId}/phases/${phase.id}`,
  pathname,
  url
)}
badge={
  name === 'report' && !isExpired('01-04-2024') ? (
    <Box display="inline" ml="8px">
      <NewBadge />
    </Box>
  ) : null
}
disabledTooltipText={disabledTooltipText}
/> */
}

export default AdminProjectsProjectIndex;
