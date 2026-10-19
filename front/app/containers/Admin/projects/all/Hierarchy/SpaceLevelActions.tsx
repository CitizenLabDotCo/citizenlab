import React, { useState } from 'react';

import useSpaceModerators from 'api/space_moderators/useSpaceModerators';

import { useIntl } from 'utils/cl-intl';

import NewProjectModal from '../NewProjectModal';

import useSpaceActions from './Actions/useSpaceActions';
import LevelManagers from './LevelManagers';
import { MenuEntry } from './Menu/FlyoutMenu';
import MoreActions from './Menu/MoreActions';
import messages from './messages';

interface Props {
  spaceId: string;
}

// Beside a space's name: its managers, and what its managers can do from here,
// on top of what its tile's "⋯" offers.
const SpaceLevelActions = ({ spaceId }: Props) => {
  const { formatMessage } = useIntl();
  const [addingProject, setAddingProject] = useState(false);
  const { canManage, entries: spaceEntries } = useSpaceActions(spaceId);
  const { data: managers } = useSpaceModerators(
    canManage ? spaceId : undefined
  );

  const entries: MenuEntry[] = canManage
    ? [
        ...spaceEntries,
        {
          key: 'folder',
          icon: 'folder-add',
          label: formatMessage(messages.addFolder),
          link: {
            to: '/admin/projects/folders/new',
            search: { space_id: spaceId },
          },
        },
        {
          key: 'project',
          icon: 'plus-circle',
          label: formatMessage(messages.addProject),
          onSelect: () => setAddingProject(true),
        },
      ]
    : [];

  return (
    <>
      <LevelManagers users={managers} />
      <MoreActions entries={entries} align="left" />
      <NewProjectModal
        mode={addingProject ? 'scratch' : null}
        context={{ space_id: spaceId, folder_id: null }}
        onClose={() => setAddingProject(false)}
      />
    </>
  );
};

export default SpaceLevelActions;
