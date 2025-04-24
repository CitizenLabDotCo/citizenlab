import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import ActionForms from 'containers/Admin/projects/project/permissions/Phase/ActionForms';
const AccessRights = () => {
  const { data: project } = useCommunityMonitorProject({});
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  if (!phaseId) return null;

  return (
    <Box mt="40px">
      <ActionForms phaseId={phaseId} />
    </Box>
  );
};

export default AccessRights;
