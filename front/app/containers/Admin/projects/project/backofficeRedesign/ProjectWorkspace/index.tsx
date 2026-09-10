import React, { ReactNode, useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { useLocation } from 'utils/router';

import { sectionFromPathname } from './_shared/sections';
import useMarkSetupStep from './_shared/useMarkSetupStep';
import WorkspaceHeader from './Header';
import { HeaderDropdownName } from './Header/HeaderDropdown';
import PhaseRightPanel from './Phase/PhaseRightPanel';
import { viewFromPathname } from './Phase/usePhaseViews';
import ProjectSetupPanel from './ProjectSetupPanel';

const LEFT_PANEL_WIDTH = '280px';
const RIGHT_PANEL_WIDTH = '384px';

interface Props {
  project: IProjectData;
  phase?: IPhaseData;
  leftPanel?: ReactNode;
  children: ReactNode;
}

const ProjectWorkspace = ({ project, phase, leftPanel, children }: Props) => {
  const { pathname } = useLocation();
  const [openDropdown, setOpenDropdown] = useState<HeaderDropdownName | null>(
    null
  );
  const markSetupStep = useMarkSetupStep(project);

  const showDropdown = (dropdown: HeaderDropdownName | null) => {
    setOpenDropdown(dropdown);
    if (dropdown === 'share') markSetupStep('share');
  };

  const section = sectionFromPathname(pathname, project.id);

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
        section={section}
        openDropdown={openDropdown}
        onOpenDropdown={showDropdown}
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

        {!section && (
          <Box
            flex={`0 0 ${RIGHT_PANEL_WIDTH}`}
            width={RIGHT_PANEL_WIDTH}
            minHeight="0"
            overflowY="auto"
            borderLeft={divider}
          >
            {phase ? (
              <PhaseRightPanel />
            ) : (
              <ProjectSetupPanel
                project={project}
                onOpenDropdown={showDropdown}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProjectWorkspace;
