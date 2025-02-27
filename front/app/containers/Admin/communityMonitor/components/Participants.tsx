import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import usePhases from 'api/phases/usePhases';

import ParticipationDatesRange from 'containers/Admin/projects/project/participation/ParticipationDateRange';

const Participants = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const projectId =
    appConfiguration?.data.attributes.settings.community_monitor?.project_id;

  const { data: phases } = usePhases(projectId);

  const startOfFirstPhase = phases?.data[0]?.attributes.start_at;
  const endOfLastPhase =
    phases?.data[phases.data.length - 1]?.attributes.end_at;

  if (!phases) return null;
  return (
    <Box mt="40px" ml="-44px">
      <ParticipationDatesRange
        defaultStartDate={startOfFirstPhase}
        defaultEndDate={endOfLastPhase ?? undefined}
      />
    </Box>
  );
};

export default Participants;
