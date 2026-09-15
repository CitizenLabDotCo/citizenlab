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

const PROJECT_PANEL_WIDTH = '280px';
const PHASE_PANEL_WIDTH = '384px';
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
  const activeView = viewFromPathname(pathname);

  const divider = `1px solid ${colors.grey200}`;
  const leftPanelWidth = phase ? PHASE_PANEL_WIDTH : PROJECT_PANEL_WIDTH;
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
        section={section}
        openDropdown={openDropdown}
        onOpenDropdown={showDropdown}
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

        {!section && (
          <Box
            display={showPanels ? 'block' : 'none'}
            flex={`0 0 ${RIGHT_PANEL_WIDTH}`}
            width={RIGHT_PANEL_WIDTH}
            minHeight="0"
            overflowY="auto"
            borderLeft={divider}
          >
            {phase ? (
              <PhaseRightPanel
                key={phase.id}
                projectId={project.id}
                phase={phase}
              />
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
