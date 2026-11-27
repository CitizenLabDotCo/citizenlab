import React, {
  ReactNode,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
} from 'react';

import Spinner from 'design-system/Spinner';

import { IPhaseData, InputTerm } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { usePageSave } from 'components/admin/PageSaveContext';
import PageLoadingFallbackContext from 'components/UI/PageLoading/FallbackContext';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useLocation, useSearch } from 'utils/router';

import EarlyAccessBanner from '../earlyAccess/EarlyAccessBanner';

import { sectionFromPathname } from './_shared/sections';
import WorkspaceHeader from './Header';
import { HeaderDropdownName } from './Header/HeaderDropdown';
import PanelToggleButton from './PanelToggleButton';
import { useParticipationPanel } from './ParticipationPanelContext';
import GoesLiveNote from './Phase/GoesLiveNote';
import MethodSettings from './Phase/MethodSettings';
import { viewFromPathname, PhaseViewKey } from './Phase/usePhaseViews';
import ViewContent from './Phase/ViewContent';
import ProjectSetupPanel from './ProjectSetupPanel';
import ProjectTimeline from './ProjectTimeline';
import styles from './ProjectWorkspace.module.css';
import InsightsSkeleton from './WorkspaceSkeleton/InsightsSkeleton';
import ManageSkeleton from './WorkspaceSkeleton/ManageSkeleton';
import PhasePanelSkeleton from './WorkspaceSkeleton/PhasePanelSkeleton';
import StageSkeleton from './WorkspaceSkeleton/StageSkeleton';
import TimelineSkeleton from './WorkspaceSkeleton/TimelineSkeleton';
import 'design-system/tokens.css';

const InputTags = lazy(() => import('./InputTags'));

// Lazy so ArcGIS only loads once the map is opened.
const CustomMapConfigPage = lazy(
  () => import('containers/Admin/CustomMapConfigPage')
);

interface Draft {
  inputTerm?: InputTerm;
  label: string;
  parentLabel?: string;
  saveLabel?: string;
  // Why Save is off, while a required field is still empty.
  saveDisabledReason?: string;
  methodSettings?: ReactNode;
}

interface Props {
  project: IProjectData;
  phase?: IPhaseData;
  // The URL names a phase that has not loaded yet.
  phasePending?: boolean;
  draft?: Draft;
  sidePanel?: ReactNode;
  // An event's setup panel is 560 wide; a phase's is 480.
  wideSidePanel?: boolean;
  withParticipation?: boolean;
  activeView?: PhaseViewKey;
  viewSwitch?: ReactNode;
  children: ReactNode;
}

const ProjectWorkspace = ({
  project,
  phase,
  phasePending = false,
  draft,
  sidePanel,
  wideSidePanel = false,
  withParticipation = true,
  activeView: providedActiveView,
  viewSwitch,
  children,
}: Props) => {
  const { pending, collapsed, animate } = useParticipationPanel();
  const { pathname } = useLocation();
  const { map_config, input_tags } = useSearch({ strict: false });
  const [openDropdown, setOpenDropdown] = useState<HeaderDropdownName | null>(
    null
  );
  const pageSave = usePageSave();

  const section = sectionFromPathname(pathname, project.id);
  const activeView = providedActiveView ?? viewFromPathname(pathname);

  const inPhase = !!(phase || draft || phasePending);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const wasSaving = useRef(false);
  const saving = pageSave?.saving ?? false;

  useEffect(() => {
    const finishedSaving = wasSaving.current && !saving;
    wasSaving.current = saving;
    if (!finishedSaving || !inPhase) return;

    // Wait for field errors to mount after every save attempt, including retries.
    // Design-system fields render their error in the errorMessage slot; a
    // language group marks the line that names what is left to translate.
    const frame = requestAnimationFrame(() => {
      const error = workspaceRef.current?.querySelector<HTMLElement>(
        '[slot="errorMessage"], [data-translation-gap], .e2e-error-message:not(.error-exit):not(.error-exit-active)'
      );
      error?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => cancelAnimationFrame(frame);
  }, [saving, inPhase]);

  // An open phase email takes the whole width.
  const editingEmail = /\/emails\/[^/]+\/edit$/.test(pathname);
  // Keep phase fields mounted while the map replaces the settings and preview.
  const editingMap = inPhase && !!map_config;
  const editingTags = inPhase && !!input_tags;
  const [tagsOpened, setTagsOpened] = useState(false);
  if (editingTags && !tagsOpened) setTagsOpened(true);
  const showPanels = activeView === 'build' && !editingEmail && !editingMap;
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
  const showParticipation = withParticipation && !editingEmail;
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
        {pending ? (
          <TimelineSkeleton />
        ) : (
          <ProjectTimeline projectId={project.id} withNewMethod={!draft} />
        )}
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
    <div
      className={`${styles.phaseSlot} ${showPanels ? '' : styles.hidden}`}
      data-wide={wideSidePanel || undefined}
    >
      {phasePending ? (
        <PhasePanelSkeleton />
      ) : (
        <div className={editingTags ? styles.hidden : undefined}>
          {sidePanel}
          {settingsPanel}
          <GoesLiveNote project={project} />
        </div>
      )}
      {tagsOpened && (
        <div className={editingTags ? undefined : styles.hidden}>
          <Suspense fallback={<Spinner />}>
            <InputTags
              key={`${project.id}-${phase?.id}-${pageSave?.revision}`}
              project={project}
              phase={phase}
              inputTerm={
                phase?.attributes.input_term ?? draft?.inputTerm ?? 'idea'
              }
            />
          </Suspense>
        </div>
      )}
    </div>
  );

  // A page loading inside the workspace shows the shapes of that view.
  const viewSkeleton = showPanels ? (
    <StageSkeleton />
  ) : activeView === 'manage' ? (
    <ManageSkeleton />
  ) : activeView === 'insights' ? (
    <InsightsSkeleton />
  ) : undefined;

  const mainSlot = (
    <div
      className={styles.mainSlot}
      // Manage and Insights bring their own white panels.
      data-bare={activeView !== 'build' || undefined}
    >
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
      {!editingMap && (
        <PageLoadingFallbackContext.Provider value={viewSkeleton}>
          {children}
        </PageLoadingFallbackContext.Provider>
      )}
    </div>
  );

  return (
    <div ref={workspaceRef} className={styles.workspace}>
      <EarlyAccessBanner />
      <WorkspaceHeader
        project={project}
        phase={phase}
        draftLabel={draft?.label}
        draftParentLabel={draft?.parentLabel}
        saveLabel={draft?.saveLabel}
        saveDisabledReason={draft?.saveDisabledReason}
        activeView={activeView}
        viewSwitch={viewSwitch}
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
          <ViewContent phase={phase} view={activeView}>
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
