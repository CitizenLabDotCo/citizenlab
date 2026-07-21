import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import ExtrasPhases from '../ExtrasPhases';
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
    <Box flex="1 1 auto" minHeight="0" overflowY="auto">
      <ProjectNavRail projectId={projectId} />
      <TimelinePhases projectId={projectId} />
      <ExtrasPhases projectId={projectId} />
    </Box>
  </Box>
);

export default ProjectSidebar;
