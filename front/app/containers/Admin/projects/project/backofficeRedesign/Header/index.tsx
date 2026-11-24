import React, { ReactNode } from 'react';

import { useRouter } from '@tanstack/react-router';

import Breadcrumbs, { Breadcrumb } from 'design-system/Breadcrumbs';
import IconButton from 'design-system/IconButton';
import StatusBadge from 'design-system/StatusBadge';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import sharedMessages from 'containers/Admin/projects/_shared/components/messages';
import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';
import { useWorkspaceHeader } from 'containers/Admin/sideBar/WorkspaceHeaderContext';

import { usePageSave } from 'components/admin/PageSaveContext';
import goBackMessages from 'components/UI/GoBackButton/messages';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import { ProjectSection } from '../_shared/sections';
import usePhaseViews, { PhaseViewKey } from '../Phase/usePhaseViews';
import ViewSwitch from '../Phase/ViewSwitch';

import styles from './Header.module.css';
import { HeaderDropdownName } from './HeaderDropdown';
import messages from './messages';
import PublishDropdown from './PublishDropdown';
import publishMessages from './PublishDropdown/messages';
import ReviewFlow from './ReviewFlow';
import SaveChangesButton from './SaveChangesButton';
import ShareDropdown from './ShareDropdown';
import 'design-system/tokens.css';

type Crumb = {
  key: string;
  label: string;
  // Absent for a level that is only a name.
  path?: string;
};

interface Props {
  project: IProjectData;
  phase?: IPhaseData;
  draftLabel?: string;
  draftParentLabel?: string;
  saveLabel?: string;
  activeView: PhaseViewKey;
  viewSwitch?: ReactNode;
  /** The back button then returns from the map to the phase. */
  editingMap?: boolean;
  section?: ProjectSection;
  openDropdown: HeaderDropdownName | null;
  onOpenDropdown: (dropdown: HeaderDropdownName | null) => void;
}

const WorkspaceHeader = ({
  project,
  phase,
  draftLabel,
  draftParentLabel,
  saveLabel,
  activeView,
  viewSwitch,
  editingMap,
  section,
  openDropdown,
  onOpenDropdown,
}: Props) => {
  const { formatMessage } = useIntl();
  const pageSave = usePageSave();
  const localize = useLocalize();
  const locale = useLocale();
  const router = useRouter();
  const workspaceHeader = useWorkspaceHeader();
  const views = usePhaseViews(phase);
  const inPhase = !!(phase || draftLabel);
  const saveButtonLabel =
    saveLabel ??
    formatMessage(
      inPhase ? phaseSetupMessages.saveChangesLabel : messages.save
    );

  const projectPath = `/admin/projects/${project.id}`;
  const projectTitle = localize(project.attributes.title_multiloc);

  const phaseCrumbs: Crumb[] = [
    { key: 'project', label: projectTitle, path: projectPath },
    ...(draftParentLabel
      ? [{ key: 'draftParent', label: draftParentLabel }]
      : []),
    ...(phase
      ? [{ key: 'phase', label: localize(phase.attributes.title_multiloc) }]
      : []),
    ...(draftLabel ? [{ key: 'draft', label: draftLabel }] : []),
  ];

  const projectCrumbs: Crumb[] = [
    {
      key: 'projects',
      label: formatMessage(messages.projectsCrumb),
      path: '/admin/projects',
    },
    {
      key: 'project',
      label: projectTitle,
      path: section ? projectPath : undefined,
    },
    ...(section
      ? [{ key: 'section', label: formatMessage(section.label) }]
      : []),
  ];

  const crumbs = inPhase ? phaseCrumbs : projectCrumbs;
  const publicationStatus = project.attributes.publication_status;

  return (
    <header
      ref={workspaceHeader?.setElement}
      data-project-workspace-header=""
      className={styles.header}
    >
      <span className={styles.separator} aria-hidden="true" />
      <div className={styles.crumbBar}>
        {inPhase &&
          (editingMap ? (
            <IconButton
              icon="arrow-left-16"
              aria-label={formatMessage(goBackMessages.goBack)}
              onPress={() => removeSearchParams(['map_config'])}
            />
          ) : (
            <IconButton
              icon="arrow-left-16"
              aria-label={formatMessage(messages.backToProjectSetup)}
              onPress={() =>
                void router.navigate({
                  to: '/$locale/admin/projects/$projectId',
                  params: { locale, projectId: project.id },
                })
              }
            />
          ))}
        <div className={styles.crumbs}>
          <Breadcrumbs
            separator={inPhase && !draftParentLabel ? 'slash' : 'chevron'}
          >
            {crumbs.map((crumb) => (
              <Breadcrumb
                key={crumb.key}
                id={crumb.key}
                href={crumb.path}
                isDisabled={!crumb.path}
              >
                {crumb.label}
              </Breadcrumb>
            ))}
          </Breadcrumbs>
          {/* A phase goes live with its project; an archived one has no badge. */}
          {phase && publicationStatus === 'draft' && (
            <StatusBadge status="draft">
              {formatMessage(sharedMessages.draft)}
            </StatusBadge>
          )}
          {phase && publicationStatus === 'published' && (
            <StatusBadge status="published">
              {formatMessage(publishMessages.publishButtonLive)}
            </StatusBadge>
          )}
        </div>
      </div>

      <div className={styles.viewSwitch}>
        {viewSwitch ??
          (phase && (
            <ViewSwitch
              label={formatMessage(messages.phaseViewSwitch)}
              views={views}
              activeView={activeView}
              projectId={project.id}
              phaseId={phase.id}
            />
          ))}
      </div>

      <div className={styles.actions}>
        {inPhase || pageSave?.dirty ? (
          <SaveChangesButton key={phase?.id} label={saveButtonLabel} />
        ) : (
          <>
            <div className={styles.dropdowns}>
              <ShareDropdown
                project={project}
                opened={openDropdown === 'share'}
                onOpenChange={(opened) =>
                  onOpenDropdown(opened ? 'share' : null)
                }
              />
              <ReviewFlow
                project={project}
                opened={openDropdown === 'review'}
                onOpenChange={(opened) =>
                  onOpenDropdown(opened ? 'review' : null)
                }
              />
              <PublishDropdown
                project={project}
                opened={openDropdown === 'publish'}
                onOpenChange={(opened) =>
                  onOpenDropdown(opened ? 'publish' : null)
                }
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default WorkspaceHeader;
