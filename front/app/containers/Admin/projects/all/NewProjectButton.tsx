import React, { useState } from 'react';

import DSButton from 'design-system/Button';
import Menu, { MenuItem, MenuTrigger } from 'design-system/Menu';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import LanguageButtonContext from 'components/admin/MultilocFields/LanguageButtonContext';
import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useSearch } from 'utils/router';

import messages from './messages';
import NewProjectModal, { NewProjectMode } from './NewProjectModal';
import 'design-system/tokens.css';

const NewProjectButton = () => {
  const { formatMessage } = useIntl();
  const redesignEnabled = useProjectBackofficeRedesign();
  const { new_project: requestedMode } = useSearch({ strict: false });
  const [mode, setMode] = useState<NewProjectMode | null>(
    requestedMode ?? null
  );

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

      <LanguageButtonContext.Provider value>
        <NewProjectModal
          mode={mode}
          onClose={() => {
            setMode(null);
            if (requestedMode) removeSearchParams(['new_project']);
          }}
        />
      </LanguageButtonContext.Provider>
    </div>
  );
};

export default NewProjectButton;
