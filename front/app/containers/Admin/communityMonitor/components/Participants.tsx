import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';
import usePhases from 'api/phases/usePhases';

import ParticipationDatesRange from 'components/admin/participation/ParticipationDateRange';

const Participants = () => {
  const { data: communityMonitorProject } = useCommunityMonitorProject({});
  const { data: phases } = usePhases(communityMonitorProject?.data.id);

  if (!communityMonitorProject || !phases?.data.length) return null;

  // Note: The Community Monitor project only uses a single, continuous phase.
  const startOfPhase = phases.data[0]?.attributes?.start_at;

  return (
    <Box mt="40px" ml="-44px">
      <ParticipationDatesRange
        projectId={communityMonitorProject.data.id}
        defaultStartDate={startOfPhase}
      />
    </Box>
  );
};

export default Participants;
