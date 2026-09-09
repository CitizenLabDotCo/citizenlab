import React, { useState } from 'react';

import { Box, Button, Title } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';

import GetStarted from './GetStarted';
import { HeaderDropdownName } from './HeaderDropdown';
import messages from './messages';
import NextActions from './NextActions';
import ProjectSettingsModal from './ProjectSettingsModal';
import SectionLinks from './SectionLinks';
import SetupFields from './SetupFields';
import useMarkSetupStep from './useMarkSetupStep';

interface Props {
  project: IProjectData;
  onOpenDropdown: (dropdown: HeaderDropdownName) => void;
}

const ProjectRightPanel = ({ project, onOpenDropdown }: Props) => {
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
        <Title variant="h4" m="0">
          {formatMessage(messages.projectSetupPanel)}
        </Title>
        <Button
          buttonStyle="secondary-outlined"
          size="s"
          padding="4px 8px"
          onClick={openSettings}
        >
          {formatMessage(messages.projectSettings)}
        </Button>
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

      <SetupFields project={project} />

      <SectionLinks projectId={project.id} />

      <ProjectSettingsModal
        project={project}
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
      />
    </Box>
  );
};

export default ProjectRightPanel;
