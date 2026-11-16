import React, { useState } from 'react';

import { IProjectData } from 'api/projects/types';

import { usePageSave } from 'components/admin/PageSaveContext';

import IconButton from 'design-system/IconButton';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';

import useMarkSetupStep from '../_shared/useMarkSetupStep';

import ArchivedPanel from './ArchivedPanel';
import BeforeYouPublish from './BeforeYouPublish';
import getPanelStage from './getPanelStage';
import LivePanel from './LivePanel';
import messages from './messages';
import PanelDivider from './PanelDivider';
import ProjectDetails from './ProjectDetails';
import styles from './ProjectSetupPanel.module.css';
import ProjectSettingsModal from './ProjectSettingsModal';
import SaveError from './SaveError';
import { SetupDraftProvider } from './SetupDraftContext';

interface Props {
  project: IProjectData;
}

const ProjectSetupPanel = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const [settingsOpened, setSettingsOpened] = useState(false);

  const pageSave = usePageSave();
  const markSetupStep = useMarkSetupStep(project);

  const openSettings = () => {
    markSetupStep('settings');
    setSettingsOpened(true);
  };

  const stage = getPanelStage(project);

  return (
    // Discarding changes bumps the revision, which resets the draft.
    <SetupDraftProvider key={pageSave?.revision} project={project}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {formatMessage(messages.projectSetupPanel)}
          </h2>
          <IconButton
            icon="settings-16"
            aria-label={formatMessage(messages.projectSettings)}
            onPress={openSettings}
          />
        </div>

        <SaveError />

        {stage === 'draft' ? (
          <BeforeYouPublish
            key={project.id}
            project={project}
            onOpenSettings={openSettings}
          />
        ) : (
          <div>
            {stage === 'live' && <LivePanel project={project} />}
            {stage === 'archived' && <ArchivedPanel project={project} />}
            <PanelDivider />
            <ProjectDetails
              key={project.id}
              project={project}
              onOpenSettings={openSettings}
            />
          </div>
        )}

        <ProjectSettingsModal
          project={project}
          opened={settingsOpened}
          onClose={() => setSettingsOpened(false)}
        />
      </div>
    </SetupDraftProvider>
  );
};

export default ProjectSetupPanel;
