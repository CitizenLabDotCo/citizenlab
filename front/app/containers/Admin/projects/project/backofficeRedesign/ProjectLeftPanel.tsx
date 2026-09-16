import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SpotlightSurveys from 'containers/Admin/projects/project/projectPage/SpotlightSurveys';
import TimelinePhases from 'containers/Admin/projects/project/projectPage/TimelinePhases';

import SelectMethodModal from './ProjectSetupPanel/SelectMethodModal';

interface Props {
  projectId: string;
}

const ProjectLeftPanel = ({ projectId }: Props) => {
  const spotlightSurveysEnabled = useFeatureFlag({
    name: 'parallel_participation',
  });
  const [methodModalOpened, setMethodModalOpened] = useState(false);

  return (
    <Box>
      <TimelinePhases
        projectId={projectId}
        onNewPhase={() => setMethodModalOpened(true)}
        withPhaseOptions
      />
      {spotlightSurveysEnabled && <SpotlightSurveys projectId={projectId} />}
      <SelectMethodModal
        projectId={projectId}
        opened={methodModalOpened}
        onClose={() => setMethodModalOpened(false)}
      />
    </Box>
  );
};

export default ProjectLeftPanel;
