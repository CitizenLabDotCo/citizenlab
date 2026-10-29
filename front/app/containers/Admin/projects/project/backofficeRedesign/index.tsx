import React, { ReactNode, Suspense, lazy, useState } from 'react';

import { Box, Spinner, bo, colors } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { usePageSave } from 'containers/Admin/projects/_shared/PageSaveContext';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useLocation, useSearch } from 'utils/router';

import FeedbackNotice from '../earlyAccess/FeedbackNotice';

import { sectionFromPathname } from './_shared/sections';
import useMarkSetupStep from './_shared/useMarkSetupStep';
import WorkspaceHeader from './Header';
import { HeaderDropdownName } from './Header/HeaderDropdown';
import MethodSettings from './Phase/MethodSettings';
import { viewFromPathname } from './Phase/usePhaseViews';
import ViewContent from './Phase/ViewContent';
import ProjectSetupPanel from './ProjectSetupPanel';

// Lazy so ArcGIS only loads once the map is opened.
const CustomMapConfigPage = lazy(
  () => import('containers/Admin/CustomMapConfigPage')
);

const PROJECT_PANEL_WIDTH = '332px';
const PHASE_PANEL_WIDTH = '560px';
const PANEL_GAP = '8px';

interface Draft {
  label: string;
  parentLabel?: string;
  saveLabel?: string;
  methodSettings?: ReactNode;
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
  const { map_config } = useSearch({ strict: false });
  const [openDropdown, setOpenDropdown] = useState<HeaderDropdownName | null>(
    null
  );
  const markSetupStep = useMarkSetupStep(project);
  const pageSave = usePageSave();

  const showDropdown = (dropdown: HeaderDropdownName | null) => {
    setOpenDropdown(dropdown);
    if (dropdown === 'share') markSetupStep('share');
  };

  const section = sectionFromPathname(pathname, project.id);
  const activeView = viewFromPathname(pathname);

  const inPhase = !!(phase || draft);
  // An open phase email takes the whole width, like the other views.
  const editingEmail = /\/emails\/[^/]+\/edit$/.test(pathname);
  // The map configuration does the same, and keeps the phase panel mounted so
  // a phase that isn't saved yet keeps its edits.
  const editingMap = inPhase && !!map_config;
  const showPanels =
    (!phase || activeView === 'build') && !editingEmail && !editingMap;
  // Once opened, the map stays mounted, so its unsaved edits wait for the
  // page's save button like the rest of the phase.
  const [mapOpened, setMapOpened] = useState(false);
  if (editingMap && !mapOpened) setMapOpened(true);

  const settingsPanel = draft ? (
    draft.methodSettings
  ) : phase ? (
    <MethodSettings
      // Its unsaved settings belong to one method: a switch, or
      // discarding the changes, starts them over.
      key={`${phase.id}-${phase.attributes.participation_method}-${pageSave?.revision}`}
      phase={phase}
    />
  ) : (
    <ProjectSetupPanel project={project} onOpenDropdown={showDropdown} />
  );

  // Each column is positioned so the visually hidden inputs of toggles and
  // radios inside it are placed, and scrolled, within the column. Otherwise
  // they hang below the page, and focusing one scrolls the whole workspace.
  const setupSlot = !section && (
    <Box
      flex={`0 0 ${PROJECT_PANEL_WIDTH}`}
      width={PROJECT_PANEL_WIDTH}
      minHeight="0"
      overflowY="auto"
      position="relative"
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
      position="relative"
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
      position="relative"
      borderRadius={bo.panelBorderRadius}
      background={colors.white}
    >
      {sidePanel}
      {settingsPanel}
    </Box>
  );

  const mainSlot = (
    <Box
      flexGrow={1}
      minWidth="0"
      minHeight="0"
      overflowY="auto"
      position="relative"
      display="flex"
      flexDirection="column"
      borderRadius={bo.panelBorderRadius}
      background={colors.grey100}
    >
      {mapOpened && (
        <Box display={editingMap ? 'block' : 'none'} h="100%">
          <Suspense fallback={<Spinner />}>
            <CustomMapConfigPage
              // Discarding the changes drops its staged edits too.
              key={pageSave?.revision}
              variant="bo"
              onBack={() => removeSearchParams(['map_config'])}
            />
          </Suspense>
        </Box>
      )}
      {!editingMap && children}
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
      <FeedbackNotice />
      <WorkspaceHeader
        project={project}
        phase={phase}
        draftLabel={draft?.label}
        draftParentLabel={draft?.parentLabel}
        saveLabel={draft?.saveLabel}
        activeView={activeView}
        editingMap={editingMap}
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
