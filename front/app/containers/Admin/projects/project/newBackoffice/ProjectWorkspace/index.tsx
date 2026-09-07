import React, { ReactNode } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { useLocation } from 'utils/router';

import { viewFromPathname } from './Phase/usePhaseViews';
import WorkspaceHeader from './WorkspaceHeader';

const LEFT_PANEL_WIDTH = '280px';
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
        activeView={viewFromPathname(pathname)}
      />

      <Box display="flex" flexGrow={1} minHeight="0" overflow="hidden">
        {leftPanel && (
          <Box
            flex={`0 0 ${LEFT_PANEL_WIDTH}`}
            width={LEFT_PANEL_WIDTH}
            minHeight="0"
            overflowY="auto"
            borderRight={divider}
          >
            {leftPanel}
          </Box>
        )}

        <Box flexGrow={1} minWidth="0" minHeight="0" overflowY="auto">
          {children}
        </Box>

        {rightPanel && (
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
