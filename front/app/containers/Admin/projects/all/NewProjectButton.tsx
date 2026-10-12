import React, { useState } from 'react';

import { Box, Dropdown, bo } from '@citizenlab/cl2-component-library';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import NewProjectMenuItem from './NewProjectMenuItem';
import NewProjectModal, { NewProjectMode } from './NewProjectModal';

const NewProjectButton = () => {
  const { formatMessage } = useIntl();
  const redesignEnabled = useProjectBackofficeRedesign();
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [mode, setMode] = useState<NewProjectMode | null>(null);

  const openModal = (mode: NewProjectMode) => {
    setDropdownOpened(false);
    setMode(mode);
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
            <NewProjectMenuItem
              icon="page"
              label={formatMessage(messages.fromScratchMenuItem)}
              onClick={() => openModal('scratch')}
            />
            <NewProjectMenuItem
              icon="grid"
              label={formatMessage(messages.useTemplateMenuItem)}
              onClick={() => openModal('template')}
            />
          </Box>
        }
      />

      <NewProjectModal mode={mode} onClose={() => setMode(null)} />
    </Box>
  );
};

export default NewProjectButton;
