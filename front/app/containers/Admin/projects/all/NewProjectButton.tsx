import React, { useState } from 'react';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import Button from 'components/UI/ButtonWithLink';

import DSButton from 'design-system/Button';
import Menu, { MenuItem, MenuTrigger } from 'design-system/Menu';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import NewProjectModal, { NewProjectMode } from './NewProjectModal';
import 'design-system/tokens.css';

const NewProjectButton = () => {
  const { formatMessage } = useIntl();
  const redesignEnabled = useProjectBackofficeRedesign();
  const [mode, setMode] = useState<NewProjectMode | null>(null);

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
    // The product tour points at this class; the design-system button takes no className.
    <div className="intercom-admin-projects-new-project-button">
      <MenuTrigger>
        <DSButton
          data-cy="e2e-new-project-button"
          variant="primary"
          size={32}
          icon="plus-16"
          hasMenu
        >
          <FormattedMessage {...messages.newProject} />
        </DSButton>
        <Menu placement="bottom end">
          <MenuItem icon="file-16" onAction={() => setMode('scratch')}>
            {formatMessage(messages.fromScratchMenuItem)}
          </MenuItem>
          <MenuItem icon="copy-16" onAction={() => setMode('template')}>
            {formatMessage(messages.useTemplateMenuItem)}
          </MenuItem>
        </Menu>
      </MenuTrigger>

      <NewProjectModal mode={mode} onClose={() => setMode(null)} />
    </div>
  );
};

export default NewProjectButton;
