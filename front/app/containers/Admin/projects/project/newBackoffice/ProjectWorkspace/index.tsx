import React, { ReactNode } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { useLocation } from 'utils/router';

import { PhaseViewKey } from './Phase/usePhaseViews';
import WorkspaceHeader from './WorkspaceHeader';

const PROJECT_PANEL_WIDTH = '280px';
// The phase panel holds form fields rather than a list, so it needs the same
// room as the right panel.
const PHASE_PANEL_WIDTH = '384px';
const RIGHT_PANEL_WIDTH = '384px';

const activeViewFromPath = (pathname: string): PhaseViewKey => {
  if (pathname.endsWith('/ideas') || pathname.endsWith('/proposals')) {
    return 'manage';
  }
  if (pathname.endsWith('/insights') || pathname.endsWith('/survey-results')) {
    return 'insights';
  }

  return 'build';
};

interface Props {
  project: IProjectData;
  phase?: IPhaseData;
  leftPanel?: ReactNode;
  rightPanel?: ReactNode;
  children: ReactNode;
}

const ProjectWorkspace = ({
  project,
  phase,
  leftPanel,
  rightPanel,
  children,
}: Props) => {
  const { pathname } = useLocation();
  const divider = `1px solid ${colors.grey200}`;
  const leftPanelWidth = phase ? PHASE_PANEL_WIDTH : PROJECT_PANEL_WIDTH;
  const activeView = activeViewFromPath(pathname);

  // A phase is built in three columns, but managed and analysed across the
  // full width, so its panels step aside on those two views.
  const showPanels = !phase || activeView === 'build';

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      overflow="hidden"
      background={colors.white}
    >
      <WorkspaceHeader
        project={project}
        phase={phase}
        activeView={activeView}
      />

      <Box display="flex" flexGrow={1} minHeight="0" overflow="hidden">
        {showPanels && leftPanel && (
          <Box
            flex={`0 0 ${leftPanelWidth}`}
            width={leftPanelWidth}
            minHeight="0"
            overflowY="auto"
            borderRight={divider}
          >
            {leftPanel}
          </Box>
        )}

        {/* A flex column so a centre that fills the stage (the phase preview)
            stretches to it, rather than collapsing to its content. */}
        <Box
          flexGrow={1}
          minWidth="0"
          minHeight="0"
          overflowY="auto"
          display="flex"
          flexDirection="column"
        >
          {children}
        </Box>

        {showPanels && rightPanel && (
          <Box
            flex={`0 0 ${RIGHT_PANEL_WIDTH}`}
            width={RIGHT_PANEL_WIDTH}
            minHeight="0"
            overflowY="auto"
            borderLeft={divider}
          >
            {rightPanel}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProjectWorkspace;
