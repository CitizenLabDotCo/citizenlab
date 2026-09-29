import React, { useState } from 'react';

import {
  Box,
  Button,
  Title,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';

import useMarkSetupStep from '../_shared/useMarkSetupStep';
import { HeaderDropdownName } from '../Header/HeaderDropdown';
import messages from '../messages';

import GetStarted from './GetStarted';
import NextActions from './NextActions';
import ProjectSettingsModal from './ProjectSettingsModal';
import SectionLinks from './SectionLinks';
import SetupDropdowns from './SetupDropdowns';

interface Props {
  project: IProjectData;
  onOpenDropdown: (dropdown: HeaderDropdownName) => void;
}

const ProjectSetupPanel = ({ project, onOpenDropdown }: Props) => {
  const { formatMessage } = useIntl();
  const [settingsOpened, setSettingsOpened] = useState(false);
  const markSetupStep = useMarkSetupStep(project);

  const openSettings = () => {
    markSetupStep('settings');
    setSettingsOpened(true);
  };

  const published = project.attributes.publication_status === 'published';

  return (
    <Box p="20px" display="flex" flexDirection="column" gap="20px">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Title variant="h4" fontSize="s" fontWeight="semi-bold" m="0">
          {formatMessage(messages.projectSetupPanel)}
        </Title>
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

      {published ? (
        <NextActions project={project} />
      ) : (
        <GetStarted
          project={project}
          onOpenSettings={openSettings}
          onOpenDropdown={onOpenDropdown}
        />
      )}

      <SetupDropdowns project={project} />

      <SectionLinks projectId={project.id} />

      <ProjectSettingsModal
        project={project}
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
      />
    </Box>
  );
};

export default ProjectSetupPanel;
