import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import SpotlightSurveys from 'containers/Admin/projects/project/projectPage/SpotlightSurveys';
import TimelinePhases from 'containers/Admin/projects/project/projectPage/TimelinePhases';

interface Props {
  projectId: string;
}

const ProjectLeftPanel = ({ projectId }: Props) => {
  return (
    <Box>
      <TimelinePhases projectId={projectId} />
      <SpotlightSurveys projectId={projectId} />
    </Box>
  );
};

export default ProjectLeftPanel;
