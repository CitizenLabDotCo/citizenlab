import React, { ReactNode } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { useLocation } from 'utils/router';

import { viewFromPathname } from './Phase/usePhaseViews';
import WorkspaceHeader from './WorkspaceHeader';

const PROJECT_PANEL_WIDTH = '280px';
const PHASE_PANEL_WIDTH = '384px';
const RIGHT_PANEL_WIDTH = '384px';

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
  const activeView = viewFromPathname(pathname);
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
        {leftPanel && (
          <Box
            display={showPanels ? 'block' : 'none'}
            flex={`0 0 ${leftPanelWidth}`}
            width={leftPanelWidth}
            minHeight="0"
            overflowY="auto"
            borderRight={divider}
          >
            {leftPanel}
          </Box>
        )}
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

        {rightPanel && (
          <Box
            display={showPanels ? 'block' : 'none'}
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
