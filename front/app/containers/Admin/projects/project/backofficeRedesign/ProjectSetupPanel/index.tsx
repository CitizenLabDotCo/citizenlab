import React, { useState } from 'react';

import {
  Box,
  Button,
  Text,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import { usePageSave } from 'components/admin/PageSaveContext';

import { useIntl } from 'utils/cl-intl';

import useMarkSetupStep from '../_shared/useMarkSetupStep';
import messages from '../messages';

import ArchivedPanel from './ArchivedPanel';
import BeforeYouPublish from './BeforeYouPublish';
import getPanelStage from './getPanelStage';
import LivePanel from './LivePanel';
import PanelDivider from './PanelDivider';
import ProjectDetails from './ProjectDetails';
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
      <Box p="18px" display="flex" flexDirection="column" gap="16px">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box as="h2" m="0">
            <Text as="span" variant="boSection" m="0">
              {formatMessage(messages.projectSetupPanel)}
            </Text>
          </Box>
          <Tooltip
            content={formatMessage(messages.projectSettings)}
            theme="dark"
            placement="bottom"
          >
            <Button
              buttonStyle="bo-text"
              icon="settings"
              width="36px"
              padding="0"
              bgHoverColor={colors.grey100}
              iconHoverColor={colors.textPrimary}
              ariaLabel={formatMessage(messages.projectSettings)}
              onClick={openSettings}
            />
          </Tooltip>
        </Box>

        <SaveError />

        {stage === 'draft' ? (
          <BeforeYouPublish
            key={project.id}
            project={project}
            onOpenSettings={openSettings}
          />
        ) : (
          <Box>
            {stage === 'live' && <LivePanel project={project} />}
            {stage === 'archived' && <ArchivedPanel project={project} />}
            <PanelDivider />
            <ProjectDetails
              key={project.id}
              project={project}
              onOpenSettings={openSettings}
            />
          </Box>
        )}

        <ProjectSettingsModal
          project={project}
          opened={settingsOpened}
          onClose={() => setSettingsOpened(false)}
        />
      </Box>
    </SetupDraftProvider>
  );
};

export default ProjectSetupPanel;
