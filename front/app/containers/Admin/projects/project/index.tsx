import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import {
  Outlet as RouterOutlet,
  useLocation,
  useParams,
} from 'react-router-dom';

import Tab from 'components/admin/NavigationTabs/Tab';

import ProjectHeader from './projectHeader';

const AdminProjectsProjectIndex = () => {
  const { pathname } = useLocation();
  const { projectId } = useParams() as { projectId: string };
  return (
    <>
      <ProjectHeader projectId={projectId} />
      <Box
        display="flex"
        px="32px"
        bg={colors.white}
        borderTop={`1px solid ${colors.background}`}
      >
        <Tab
          label="Timeline"
          url={`/admin/projects/${projectId}/phases/setup`}
          active={pathname.includes(`/admin/projects/${projectId}/phases`)}
        />
        <Tab
          label="Traffic"
          url={`/admin/projects/${projectId}/traffic`}
          active={pathname.includes(`/admin/projects/${projectId}/traffic`)}
        />
        <Tab
          label="Participation"
          url={`/admin/projects/${projectId}/participation`}
          active={pathname.includes(
            `/admin/projects/${projectId}/participation`
          )}
        />
      </Box>
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
