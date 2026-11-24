import React, { useState } from 'react';

import IconButton from 'design-system/IconButton';
import Text from 'design-system/Text';

import { IProjectData } from 'api/projects/types';

import { usePageSave } from 'components/admin/PageSaveContext';

import { useIntl } from 'utils/cl-intl';

import useMarkSetupStep from '../_shared/useMarkSetupStep';

import ArchivedPanel from './ArchivedPanel';
import BeforeYouPublish from './BeforeYouPublish';
import getPanelStage from './getPanelStage';
import LivePanel from './LivePanel';
import messages from './messages';
import PanelDivider from './PanelDivider';
import ProjectDetails from './ProjectDetails';
import ProjectSettingsModal from './ProjectSettingsModal';
import styles from './ProjectSetupPanel.module.css';
import SaveError from './SaveError';
import { SetupDraftProvider } from './SetupDraftContext';
import 'design-system/tokens.css';

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
          <Text as="h2" variant="uiStrong" tone="primary">
            {formatMessage(messages.projectSetupPanel)}
          </Text>
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
