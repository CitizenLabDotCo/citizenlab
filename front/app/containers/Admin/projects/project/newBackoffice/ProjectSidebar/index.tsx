import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import ProjectNavRail from '../ProjectNavRail';
import TimelinePhases from '../TimelinePhases';

const SIDEBAR_WIDTH = '248px';

interface Props {
  projectId: string;
}

/**
 * Left column of the redesigned project back office: the primary navigation
 * rail stacked on top of the vertical timeline-phases list. (The Activities
 * panel will be added below in a later step.)
 *
 * The sidebar is pinned (sticky) and always spans the full viewport height, so
 * it stays in place while the main content scrolls; anything that overflows
 * scrolls within the sidebar rather than with the page.
 */
const ProjectSidebar = ({ projectId }: Props) => (
  <Box
    flex={`0 0 ${SIDEBAR_WIDTH}`}
    width={SIDEBAR_WIDTH}
    background={colors.white}
    borderRight={`1px solid ${colors.grey200}`}
    display="flex"
    flexDirection="column"
    position="sticky"
    top="0"
    alignSelf="flex-start"
    height="100vh"
    overflowY="auto"
  >
    <ProjectNavRail projectId={projectId} />
    <TimelinePhases projectId={projectId} />
  </Box>
);

export default ProjectSidebar;
