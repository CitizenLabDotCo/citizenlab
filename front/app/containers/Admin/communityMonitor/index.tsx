import React from 'react';

import { Box, Button, colors, Title } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet } from 'react-router-dom';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectById from 'api/projects/useProjectById';

import clHistory from 'utils/cl-router/history';

import NavigationHeader from './components/NavigationHeader';

const CommunityMonitor = () => {
  // NOTE: THIS COMPONENT IS ONLY A PLACEHOLDER. TAB UI IMPLEMENTED IN SEPARATE PR.
  const { data: appConfiguration } = useAppConfiguration();
  const communityMonitorProjectId =
    appConfiguration?.data.attributes.settings.community_monitor?.project_id;

  const { data: project } = useProjectById(communityMonitorProjectId);
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  return (
    <Box background={colors.background}>
      <NavigationHeader />
      <RouterOutlet />
      <Title>Community Monitor Page - WIP - Placeholder</Title>
      <Button
        onClick={() => {
          clHistory.push(
            `/admin/community-monitor/projects/${communityMonitorProjectId}/phases/${phaseId}/survey/edit`
          );
        }}
      >
        Test: Go to community monitor form editor
      </Button>
    </Box>
  );
};

export default CommunityMonitor;
