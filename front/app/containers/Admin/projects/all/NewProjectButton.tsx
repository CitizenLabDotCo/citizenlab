import React, { useState } from 'react';

import { Box, Dropdown, bo } from '@citizenlab/cl2-component-library';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import ProjectGenerator from 'containers/Admin/projects/_shared/components/ProjectGenerator';

import useAiAssistantEnabled from 'components/AiAssistant/useAiAssistantEnabled';
import Button from 'components/UI/ButtonWithLink';
import DropdownMenuItem from 'components/UI/DropdownMenuItem';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import NewProjectModal, { NewProjectMode } from './NewProjectModal';

const NewProjectButton = () => {
  const { formatMessage } = useIntl();
  const redesignEnabled = useProjectBackofficeRedesign();
  const assistantEnabled = useAiAssistantEnabled();
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [mode, setMode] = useState<NewProjectMode | null>(null);
  const [generatorOpened, setGeneratorOpened] = useState(false);

  const openModal = (mode: NewProjectMode) => {
    setDropdownOpened(false);
    setGeneratorOpened(false);
    setMode(mode);
  };

  const openGenerator = () => {
    setDropdownOpened(false);
    setGeneratorOpened(true);
  };

  if (!redesignEnabled) {
    return (
      <Button
        data-cy="e2e-new-project-button"
        className="intercom-admin-projects-new-project-button"
        to="/admin/projects/new"
        icon="plus-circle"
        buttonStyle="admin-dark"
      >
        <FormattedMessage {...messages.newProject} />
      </Button>
    );
  }

  return (
    <Box position="relative">
      <Button
        data-cy="e2e-new-project-button"
        className="intercom-admin-projects-new-project-button"
        icon="plus-circle"
        buttonStyle="admin-dark"
        onClick={() => setDropdownOpened(!dropdownOpened)}
        aria-haspopup="menu"
        aria-expanded={dropdownOpened}
      >
        <FormattedMessage {...messages.newProject} />
      </Button>

      <Dropdown
        opened={dropdownOpened}
        onClickOutside={() => setDropdownOpened(false)}
        top="calc(100% + 6px)"
        right="0px"
        width="200px"
        borderRadius={bo.borderRadius}
        content={
          <Box role="menu">
            <DropdownMenuItem
              icon="page"
              label={formatMessage(messages.fromScratchMenuItem)}
              onClick={() => openModal('scratch')}
            />
            <DropdownMenuItem
              icon="grid"
              label={formatMessage(messages.useTemplateMenuItem)}
              onClick={() => openModal('template')}
            />
            {assistantEnabled && (
              <DropdownMenuItem
                icon="stars"
                label={formatMessage(messages.withAiMenuItem)}
                onClick={openGenerator}
              />
            )}
          </Box>
        }
      />

      <NewProjectModal mode={mode} onClose={() => setMode(null)} />
      <ProjectGenerator
        opened={generatorOpened}
        onClose={() => setGeneratorOpened(false)}
        onStartFromScratch={() => openModal('scratch')}
      />
    </Box>
  );
};

export default NewProjectButton;
