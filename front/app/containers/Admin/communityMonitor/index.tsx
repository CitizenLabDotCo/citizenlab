import React from 'react';

import { Box, Button, Title } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectById from 'api/projects/useProjectById';

import clHistory from 'utils/cl-router/history';

const CommunityMonitor = () => {
  // NOTE: This component is only a placeholder until the tab UI is implemented.
  const { data: appConfiguration } = useAppConfiguration();
  const communityMonitorProjectId =
    appConfiguration?.data.attributes.settings.community_monitor?.project_id;

  const { data: project } = useProjectById(communityMonitorProjectId);
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  return (
    <Box display="flex">
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
