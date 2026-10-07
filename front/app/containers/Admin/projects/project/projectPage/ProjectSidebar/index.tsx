import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import ProjectNavRail from '../ProjectNavRail';
import SpotlightSurveys from '../SpotlightSurveys';
import TimelinePhases from '../TimelinePhases';

const SIDEBAR_WIDTH = '248px';

interface Props {
  projectId: string;
}

const ProjectSidebar = ({ projectId }: Props) => {
  return (
    <Box
      flex={`0 0 ${SIDEBAR_WIDTH}`}
      width={SIDEBAR_WIDTH}
      background={colors.white}
      borderRight={`1px solid ${colors.grey200}`}
      display="flex"
      flexDirection="column"
      height="100%"
      minHeight="0"
      overflow="hidden"
    >
      <Box flex="1 1 auto" minHeight="0" overflowY="auto">
        <ProjectNavRail projectId={projectId} />
        <Box
          className="intercom-product-tour-project-timeline"
          p="12px"
          borderTop={`1px solid ${colors.grey200}`}
        >
          <TimelinePhases projectId={projectId} />
        </Box>
        <SpotlightSurveys projectId={projectId} />
      </Box>
    </Box>
  );
};

export default ProjectSidebar;
