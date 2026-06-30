import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import ProjectNavRail from '../ProjectNavRail';
import TimelinePhases from '../TimelinePhases';

const SIDEBAR_WIDTH = '248px';

interface Props {
  projectId: string;
}

const ProjectSidebar = ({ projectId }: Props) => (
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
    <ProjectNavRail projectId={projectId} />
    <Box flex="1 1 auto" minHeight="0" overflowY="auto">
      <TimelinePhases projectId={projectId} />
    </Box>
  </Box>
);

export default ProjectSidebar;
