import React, { useState } from 'react';

import { Box, Button, Title } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';

import GetStarted from './GetStarted';
import { HeaderDropdownName } from './HeaderDropdown';
import messages from './messages';
import ProjectSettingsModal from './ProjectSettingsModal';
import SectionLinks from './SectionLinks';
import SetupFields from './SetupFields';

interface Props {
  project: IProjectData;
  shareOpened: boolean;
  onOpenDropdown: (dropdown: HeaderDropdownName) => void;
}

const ProjectRightPanel = ({ project, shareOpened, onOpenDropdown }: Props) => {
  const { formatMessage } = useIntl();
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

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
          onClick={() => setSettingsOpened(true)}
        >
          {formatMessage(messages.projectSettings)}
        </Button>
      </Box>

      <GetStarted
        project={project}
        settingsSaved={settingsSaved}
        shareOpened={shareOpened}
        onOpenSettings={() => setSettingsOpened(true)}
        onOpenDropdown={onOpenDropdown}
      />

      <SetupFields project={project} />

      <SectionLinks projectId={project.id} />

      <ProjectSettingsModal
        project={project}
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
        onSaved={() => setSettingsSaved(true)}
      />
    </Box>
  );
};

export default ProjectRightPanel;
