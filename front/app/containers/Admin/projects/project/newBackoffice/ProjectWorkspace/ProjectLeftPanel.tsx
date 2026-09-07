import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SpotlightSurveys from '../../projectPage/SpotlightSurveys';
import TimelinePhases from '../../projectPage/TimelinePhases';

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
