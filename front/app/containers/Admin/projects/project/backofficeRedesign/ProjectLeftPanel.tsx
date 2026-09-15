import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SpotlightSurveys from 'containers/Admin/projects/project/projectPage/SpotlightSurveys';
import TimelinePhases from 'containers/Admin/projects/project/projectPage/TimelinePhases';

interface Props {
  projectId: string;
}

const ProjectLeftPanel = ({ projectId }: Props) => {
  const spotlightSurveysEnabled = useFeatureFlag({
    name: 'parallel_participation',
  });

  return (
    <Box>
      <TimelinePhases projectId={projectId} />
      {spotlightSurveysEnabled && <SpotlightSurveys projectId={projectId} />}
    </Box>
  );
};

export default ProjectLeftPanel;
