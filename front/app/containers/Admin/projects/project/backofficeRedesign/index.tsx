import React, { ReactNode, useState } from 'react';

import { Box, bo, colors } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { useLocation } from 'utils/router';

import { usePhaseSave } from './_shared/PhaseSaveContext';
import { sectionFromPathname } from './_shared/sections';
import useMarkSetupStep from './_shared/useMarkSetupStep';
import WorkspaceHeader from './Header';
import { HeaderDropdownName } from './Header/HeaderDropdown';
import MethodSettings from './Phase/MethodSettings';
import { viewFromPathname } from './Phase/usePhaseViews';
import ViewContent from './Phase/ViewContent';
import ProjectSetupPanel from './ProjectSetupPanel';

const PROJECT_PANEL_WIDTH = '332px';
const PHASE_PANEL_WIDTH = '560px';
const PANEL_GAP = '8px';

interface Draft {
  label: string;
  methodSettings: ReactNode;
}

interface Props {
  project: IProjectData;
  phase?: IPhaseData;
  draft?: Draft;
  sidePanel?: ReactNode;
  children: ReactNode;
}

const ProjectWorkspace = ({
  project,
  phase,
  draft,
  sidePanel,
  children,
}: Props) => {
  const { pathname } = useLocation();
  const [openDropdown, setOpenDropdown] = useState<HeaderDropdownName | null>(
    null
  );
  const markSetupStep = useMarkSetupStep(project);
  const phaseSave = usePhaseSave();

  const showDropdown = (dropdown: HeaderDropdownName | null) => {
    setOpenDropdown(dropdown);
    if (dropdown === 'share') markSetupStep('share');
  };

  const section = sectionFromPathname(pathname, project.id);
  const activeView = viewFromPathname(pathname);

  const inPhase = !!(phase || draft);
  const showPanels = !phase || activeView === 'build';

  const settingsPanel = draft ? (
    draft.methodSettings
  ) : phase ? (
    <MethodSettings
      // Its unsaved settings belong to one method: a switch, or
      // discarding the changes, starts them over.
      key={`${phase.id}-${phase.attributes.participation_method}-${phaseSave?.revision}`}
      phase={phase}
    />
  ) : (
    <ProjectSetupPanel project={project} onOpenDropdown={showDropdown} />
  );

  const setupSlot = !section && (
    <Box
      flex={`0 0 ${PROJECT_PANEL_WIDTH}`}
      width={PROJECT_PANEL_WIDTH}
      minHeight="0"
      overflowY="auto"
      borderRadius={bo.panelBorderRadius}
      background={colors.white}
    >
      {settingsPanel}
    </Box>
  );
  const timelineSlot = sidePanel && (
    <Box
      flex={`0 0 ${PROJECT_PANEL_WIDTH}`}
      width={PROJECT_PANEL_WIDTH}
      minHeight="0"
      overflowY="auto"
      borderRadius={bo.panelBorderRadius}
      background={colors.white}
    >
      {sidePanel}
    </Box>
  );
  // A phase has a single panel: its build fields, then its settings.
  const phaseSlot = (
    <Box
      display={showPanels ? 'block' : 'none'}
      flex={`0 0 ${PHASE_PANEL_WIDTH}`}
      width={PHASE_PANEL_WIDTH}
      minHeight="0"
      overflowY="auto"
      borderRadius={bo.panelBorderRadius}
      background={colors.white}
    >
      {sidePanel}
      <Box borderTop={`1px solid ${colors.grey200}`}>{settingsPanel}</Box>
    </Box>
  );

  const mainSlot = (
    <Box
      flexGrow={1}
      minWidth="0"
      minHeight="0"
      overflowY="auto"
      display="flex"
      flexDirection="column"
      borderRadius={bo.panelBorderRadius}
      background={colors.grey100}
    >
      {children}
    </Box>
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={PANEL_GAP}
      p={PANEL_GAP}
      height="100vh"
      overflow="hidden"
      background={colors.background}
    >
      <WorkspaceHeader
        project={project}
        phase={phase}
        draftLabel={draft?.label}
        activeView={activeView}
        section={section}
        openDropdown={openDropdown}
        onOpenDropdown={showDropdown}
      />

      <Box
        display="flex"
        gap={PANEL_GAP}
        flexGrow={1}
        minHeight="0"
        overflow="hidden"
      >
        {inPhase ? phaseSlot : setupSlot}

        {phase && activeView !== 'build' ? (
          <ViewContent project={project} phase={phase} view={activeView}>
            {mainSlot}
          </ViewContent>
        ) : (
          mainSlot
        )}

        {!inPhase && timelineSlot}
      </Box>
    </Box>
  );
};

export default ProjectWorkspace;
