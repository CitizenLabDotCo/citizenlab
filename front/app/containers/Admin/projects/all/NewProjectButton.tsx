import React, { useState } from 'react';

import { Box, Dropdown } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import ProjectAssistantModal from '../project/backofficeRedesign/ProjectAssistantModal';

import messages from './messages';
import NewProjectModal, { NewProjectMode } from './NewProjectModal';
import OptionCard from './OptionCard';

const NewProjectButton = () => {
  const { formatMessage } = useIntl();
  const redesignEnabled = useFeatureFlag({
    name: 'project_backoffice_redesign',
  });
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [mode, setMode] = useState<NewProjectMode | null>(null);
  // The AI assistant create flow opens as its own full modal, not one of the
  // NewProjectModal tabs.
  const [assistantOpened, setAssistantOpened] = useState(false);

  const openModal = (mode: NewProjectMode) => {
    setDropdownOpened(false);
    setMode(mode);
  };

  const openAssistant = () => {
    setDropdownOpened(false);
    setAssistantOpened(true);
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
      >
        <FormattedMessage {...messages.newProject} />
      </Button>

      <Dropdown
        opened={dropdownOpened}
        onClickOutside={() => setDropdownOpened(false)}
        width="380px"
        right="0px"
        content={
          <Box>
            <OptionCard
              icon="stars"
              title="Draft with AI"
              description="Describe your project and the assistant drafts the whole thing — page, phases and survey — for you to review."
              onClick={openAssistant}
            />
            <OptionCard
              icon="plus"
              title={formatMessage(messages.fromScratch)}
              description={formatMessage(messages.fromScratchDescription)}
              onClick={() => openModal('scratch')}
            />
            <OptionCard
              icon="copy"
              title={formatMessage(messages.fromTemplate)}
              description={formatMessage(messages.fromTemplateDescription)}
              onClick={() => openModal('template')}
            />
          </Box>
        }
      />

      <NewProjectModal mode={mode} onClose={() => setMode(null)} />

      {assistantOpened && (
        <ProjectAssistantModal
          onClose={() => setAssistantOpened(false)}
          onStartFromScratch={() => {
            setAssistantOpened(false);
            setMode('scratch');
          }}
          onBrowseTemplates={() => {
            setAssistantOpened(false);
            setMode('template');
          }}
        />
      )}
    </Box>
  );
};

export default NewProjectButton;
