import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';
import usePhases from 'api/phases/usePhases';

import ParticipationDatesRange from 'containers/Admin/projects/project/participation/ParticipationDateRange';

const Participants = () => {
  const { data: communityMonitorProject } = useCommunityMonitorProject();
  const { data: phases } = usePhases(communityMonitorProject?.data.id);

  if (!phases?.data.length) return null;

  // Note: The Community Monitor project only uses a single, continuous phase.
  const startOfPhase = phases.data[0]?.attributes?.start_at;

  return (
    <Box mt="40px" ml="-44px">
      <ParticipationDatesRange defaultStartDate={startOfPhase} />
    </Box>
  );
};

export default Participants;
