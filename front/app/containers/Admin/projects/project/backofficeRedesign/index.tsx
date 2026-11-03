import React, { ReactNode, useState } from 'react';

import { Box, bo, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { usePageSave } from 'components/admin/PageSaveContext';

import { useLocation } from 'utils/router';

import FeedbackNotice from '../earlyAccess/FeedbackNotice';

import { sectionFromPathname } from './_shared/sections';
import WorkspaceHeader from './Header';
import { HeaderDropdownName } from './Header/HeaderDropdown';
import { useParticipationPanel } from './ParticipationPanelContext';
import MethodSettings from './Phase/MethodSettings';
import { viewFromPathname } from './Phase/usePhaseViews';
import ViewContent from './Phase/ViewContent';
import ProjectSetupPanel from './ProjectSetupPanel';
import ProjectTimeline from './ProjectTimeline';
import ShowPanelButton from './ShowPanelButton';

const PROJECT_PANEL_WIDTH = '332px';
const SIDE_PANEL_WIDTH = '300px';
const RAIL_WIDTH = '48px';
const PHASE_PANEL_WIDTH = '560px';
const PANEL_GAP = '8px';
const COLLAPSE_DURATION = '0.48s';
const COLLAPSE_EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';

const collapsedWidth = (rail: boolean) => (rail ? RAIL_WIDTH : '0px');
const visibilityDelay = (collapsed: boolean) =>
  collapsed ? COLLAPSE_DURATION : '0s';

interface PanelStyleProps {
  collapsed: boolean;
  rail: boolean;
  animate: boolean;
}

const panelWidth = ({ collapsed, rail }: PanelStyleProps) =>
  collapsed ? collapsedWidth(rail) : SIDE_PANEL_WIDTH;

const CollapsiblePanel = styled(Box)<PanelStyleProps>`
  flex: 0 0 ${panelWidth};
  width: ${panelWidth};
  margin-right: ${({ collapsed, rail }) =>
    collapsed && !rail ? `-${PANEL_GAP}` : '0'};
  transition: ${({ animate }) =>
    animate
      ? `flex-basis ${COLLAPSE_DURATION} ${COLLAPSE_EASING}, width ${COLLAPSE_DURATION} ${COLLAPSE_EASING}, margin-right ${COLLAPSE_DURATION} ${COLLAPSE_EASING}`
      : 'none'};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// Visibility flips once the panel has finished shrinking, so hidden content
// can't be tabbed into.
const PanelContent = styled(Box)<{ collapsed: boolean; animate: boolean }>`
  opacity: ${({ collapsed }) => (collapsed ? 0 : 1)};
  visibility: ${({ collapsed }) => (collapsed ? 'hidden' : 'visible')};
  transition: ${({ collapsed, animate }) =>
    animate
      ? `opacity 0.32s, visibility 0s linear ${visibilityDelay(collapsed)}`
      : 'none'};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

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
  withParticipation?: boolean;
  children: ReactNode;
}

const ProjectWorkspace = ({
  project,
  phase,
  draft,
  sidePanel,
  withParticipation = true,
  children,
}: Props) => {
  const participation = useParticipationPanel();
  const { pathname } = useLocation();
  const [openDropdown, setOpenDropdown] = useState<HeaderDropdownName | null>(
    null
  );
  const pageSave = usePageSave();

  const section = sectionFromPathname(pathname, project.id);
  const activeView = viewFromPathname(pathname);

  const inPhase = !!(phase || draft);
  // An open phase email takes the whole width, like the other views.
  const editingEmail = /\/emails\/[^/]+\/edit$/.test(pathname);
  const showPanels = (!phase || activeView === 'build') && !editingEmail;

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
    <ProjectSetupPanel project={project} />
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
  const showParticipation = withParticipation && (!inPhase || showPanels);
  const { collapsed, animate } = participation;
  const expandParticipation = () => participation.setCollapsed(false);
  const participationSlot = showParticipation && (
    <CollapsiblePanel
      collapsed={collapsed}
      rail={inPhase}
      animate={animate}
      minHeight="0"
      overflowX="hidden"
      overflowY={collapsed ? 'hidden' : 'auto'}
      position="relative"
      borderRadius={bo.panelBorderRadius}
      background={colors.white}
    >
      {/* Keeps the content at full width while the panel animates. */}
      <PanelContent
        collapsed={collapsed}
        animate={animate}
        aria-hidden={collapsed}
        width={SIDE_PANEL_WIDTH}
      >
        <ProjectTimeline
          projectId={project.id}
          onCollapse={() => participation.setCollapsed(true)}
        />
      </PanelContent>
      {inPhase && collapsed && (
        <Box position="absolute" top="18px" left="8px">
          <ShowPanelButton
            buttonStyle="bo-text"
            onClick={expandParticipation}
          />
        </Box>
      )}
    </CollapsiblePanel>
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
      <FeedbackNotice />
      <WorkspaceHeader
        project={project}
        phase={phase}
        draftLabel={draft?.label}
        draftParentLabel={draft?.parentLabel}
        saveLabel={draft?.saveLabel}
        activeView={activeView}
        section={section}
        openDropdown={openDropdown}
        onOpenDropdown={setOpenDropdown}
      />

      <Box
        display="flex"
        gap={PANEL_GAP}
        flexGrow={1}
        minHeight="0"
        overflow="hidden"
      >
        {!inPhase && setupSlot}

        {/* Always in this slot, so moving between the project and a phase
            keeps the same panel instead of mounting a new one. */}
        {participationSlot}

        {inPhase && phaseSlot}

        {phase && activeView !== 'build' ? (
          <ViewContent project={project} phase={phase} view={activeView}>
            {mainSlot}
          </ViewContent>
        ) : (
          <Box
            position="relative"
            display="flex"
            flexGrow={1}
            minWidth="0"
            minHeight="0"
          >
            {mainSlot}
            {showParticipation && !inPhase && collapsed && (
              <Box position="absolute" top="8px" left="8px" zIndex="1">
                <ShowPanelButton
                  buttonStyle="bo-secondary"
                  onClick={expandParticipation}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProjectWorkspace;
