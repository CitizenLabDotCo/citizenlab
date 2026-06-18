import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import Extras from '../Extras';
import ProjectNavRail from '../ProjectNavRail';
import TimelinePhases from '../TimelinePhases';

const SIDEBAR_WIDTH = '248px';

interface Props {
  projectId: string;
}

/**
 * Left column of the redesigned project back office: the primary navigation
 * rail stacked on top of the vertical timeline-phases list and the Extras
 * panel (surveys that run outside the timeline).
 *
 * The sidebar fills the full height of its (viewport-bounded) parent. The nav
 * rail keeps its natural height at the top; everything below it (Timeline
 * phases + Extras) shares the remaining space inside a single scroll region.
 * That means at most one scrollbar in the sidebar — never nested — and none at
 * all when the window is tall enough to show everything.
 */
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
      <Extras />
    </Box>
  </Box>
);

export default ProjectSidebar;
