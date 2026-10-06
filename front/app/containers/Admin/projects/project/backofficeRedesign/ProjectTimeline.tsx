import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import SpotlightSurveys from 'containers/Admin/projects/project/projectPage/SpotlightSurveys';
import TimelinePhases from 'containers/Admin/projects/project/projectPage/TimelinePhases';

import SelectMethodModal from './ProjectSetupPanel/SelectMethodModal';

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
      <SpotlightSurveys projectId={projectId} withPhaseOptions />
      <SelectMethodModal
        projectId={projectId}
        opened={methodModalOpened}
        onClose={() => setMethodModalOpened(false)}
      />
    </Box>
  );
};

export default ProjectTimeline;
