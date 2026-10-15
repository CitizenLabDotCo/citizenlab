import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Button from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import NewProjectButton from '../NewProjectButton';
import NewProjectModal, { NewProjectMode } from '../NewProjectModal';
import projectsMessages from '../Projects/Table/messages';

import FlyoutMenu, { MenuEntry } from './Menu/FlyoutMenu';
import messages from './messages';
import NewProjectFlyout from './NewProjectFlyout';

// One button for everything this user can create: spaces for admins, folders
// for admins and space managers, projects for everyone.
const NewMenu = () => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const [mode, setMode] = useState<NewProjectMode | null>(null);
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const canCreateSpace = usePermission({ item: 'space', action: 'create' });
  const canCreateFolder = usePermission({
    item: 'project_folder',
    action: 'create',
  });

  const entries: MenuEntry[] = [];
  if (spacesEnabled && canCreateSpace) {
    entries.push({
      key: 'space',
      icon: 'spaces',
      label: formatMessage(messages.space),
      link: { to: '/admin/projects/spaces/new' },
    });
  }
  if (canCreateFolder) {
    entries.push({
      key: 'folder',
      icon: 'folder-outline',
      label: formatMessage(messages.folder),
      link: { to: '/admin/projects/folders/new' },
    });
  }

  // Projects are all this user can create: the project button already offers
  // its two ways to start one.
  if (entries.length === 0) return <NewProjectButton />;

  entries.push({
    key: 'project',
    icon: 'projects',
    label: formatMessage(projectsMessages.project),
    flyout: (takeFocus: boolean) => (
      <NewProjectFlyout
        label={formatMessage(projectsMessages.project)}
        takeFocus={takeFocus}
        onPick={(newMode) => {
          setOpened(false);
          setMode(newMode);
        }}
      />
    ),
  });

  const label = formatMessage(messages.newItem);

  return (
    <Box position="relative">
      <Button
        className="intercom-admin-projects-new-project-button"
        icon="chevron-down"
        iconPos="right"
        buttonStyle="admin-dark"
        onClick={() => setOpened(!opened)}
        aria-haspopup="menu"
        aria-expanded={opened}
      >
        {label}
      </Button>
      <FlyoutMenu
        label={label}
        opened={opened}
        onClose={() => setOpened(false)}
        entries={entries}
        top="calc(100% + 6px)"
      />
      <NewProjectModal mode={mode} onClose={() => setMode(null)} />
    </Box>
  );
};

export default NewMenu;
