import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import TimelinePhases from 'containers/Admin/projects/project/projectPage/TimelinePhases';

import SelectMethodModal from './ProjectSetupPanel/SelectMethodModal';
import TimelineEvents from './TimelineEvents';

interface Props {
  projectId: string;
}

const ProjectTimeline = ({ projectId }: Props) => {
  const [methodModalOpened, setMethodModalOpened] = useState(false);

  return (
    <Box>
      <TimelinePhases
        projectId={projectId}
        onNewPhase={() => setMethodModalOpened(true)}
        withPhaseOptions
      />
      <TimelineEvents projectId={projectId} />
      <SelectMethodModal
        projectId={projectId}
        opened={methodModalOpened}
        onClose={() => setMethodModalOpened(false)}
      />
    </Box>
  );
};

export default ProjectTimeline;
