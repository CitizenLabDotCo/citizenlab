import React, { ReactNode, Suspense, lazy, useState } from 'react';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { usePageSave } from 'components/admin/PageSaveContext';

import Spinner from 'design-system/Spinner';
import 'design-system/tokens.css';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useLocation, useSearch } from 'utils/router';

import FeedbackNotice from '../earlyAccess/FeedbackNotice';

import { sectionFromPathname } from './_shared/sections';
import WorkspaceHeader from './Header';
import { HeaderDropdownName } from './Header/HeaderDropdown';
import PanelToggleButton from './PanelToggleButton';
import { useParticipationPanel } from './ParticipationPanelContext';
import MethodSettings from './Phase/MethodSettings';
import { viewFromPathname } from './Phase/usePhaseViews';
import ViewContent from './Phase/ViewContent';
import ProjectSetupPanel from './ProjectSetupPanel';
import styles from './ProjectWorkspace.module.css';
import ProjectTimeline from './ProjectTimeline';

// Lazy so ArcGIS only loads once the map is opened.
const CustomMapConfigPage = lazy(
  () => import('containers/Admin/CustomMapConfigPage')
);

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
  const { pending, collapsed, animate } = useParticipationPanel();
  const { pathname } = useLocation();
  const { map_config } = useSearch({ strict: false });
  const [openDropdown, setOpenDropdown] = useState<HeaderDropdownName | null>(
    null
  );
  const pageSave = usePageSave();

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
    <ProjectSetupPanel project={project} />
  );

  const setupSlot = !section && (
    <div className={styles.setupSlot}>{settingsPanel}</div>
  );
  const showParticipation =
    withParticipation && !pending && (!inPhase || showPanels);
  const participationSlot = showParticipation && (
    <div
      className={styles.participationSlot}
      data-collapsed={collapsed || undefined}
      data-rail={inPhase || undefined}
      data-animate={animate || undefined}
    >
      <div
        className={styles.panelContent}
        data-collapsed={collapsed || undefined}
        data-animate={animate || undefined}
        aria-hidden={collapsed}
      >
        <ProjectTimeline projectId={project.id} withNewMethod={!draft} />
      </div>
      {inPhase && collapsed && (
        <div className={styles.railToggle}>
          <PanelToggleButton variant="ghost" />
        </div>
      )}
    </div>
  );
  // A phase has a single panel: its build fields, then its settings.
  const phaseSlot = (
    <div className={`${styles.phaseSlot} ${showPanels ? '' : styles.hidden}`}>
      {sidePanel}
      {settingsPanel}
    </div>
  );

  const mainSlot = (
    <div className={styles.mainSlot}>
      {mapOpened && (
        <div className={`${styles.mapSlot} ${editingMap ? '' : styles.hidden}`}>
          <Suspense fallback={<Spinner />}>
            <CustomMapConfigPage
              // Discarding the changes drops its staged edits too.
              key={pageSave?.revision}
              variant="panel"
              onBack={() => removeSearchParams(['map_config'])}
            />
          </Suspense>
        </div>
      )}
      {!editingMap && children}
    </div>
  );

  return (
    <div className={styles.workspace}>
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
        onOpenDropdown={setOpenDropdown}
      />

      <div className={styles.columns}>
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
          <div className={styles.mainColumn}>
            {mainSlot}
            {showParticipation && !inPhase && collapsed && (
              <div className={styles.floatingToggle}>
                <PanelToggleButton variant="bordered" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectWorkspace;
