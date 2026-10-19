import React, { useState } from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import useProjectFolderModerators from 'api/project_folder_moderators/useProjectFolderModerators';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../_shared/messages';
import NewProjectModal from '../NewProjectModal';

import useFolderActions from './Actions/useFolderActions';
import LevelManagers from './LevelManagers';
import { MenuEntry } from './Menu/FlyoutMenu';
import MoreActions from './Menu/MoreActions';
import messages from './messages';

interface Props {
  folderId: string;
}

// Beside a folder's name: its managers, whether it's a draft, and what can be
// done from here, on top of what its tile's "⋯" offers.
const FolderLevelActions = ({ folderId }: Props) => {
  const { formatMessage } = useIntl();
  const [addingProject, setAddingProject] = useState(false);
  const { data: folder } = useProjectFolderById(folderId);
  const folderSpaceId = folder?.data.attributes.space_id ?? null;
  const { canModerate, entries: folderEntries } = useFolderActions({
    folderId,
    folderSpaceId,
  });
  const { data: managers } = useProjectFolderModerators(
    { projectFolderId: folderId },
    { enabled: canModerate }
  );

  if (!folder) return null;

  const { slug, publication_status } = folder.data.attributes;

  const entries: MenuEntry[] = [...folderEntries];
  if (canModerate) {
    entries.push({
      key: 'project',
      icon: 'plus-circle',
      label: formatMessage(messages.addProject),
      onSelect: () => setAddingProject(true),
    });
  }
  entries.push({
    key: 'view',
    icon: 'eye',
    label: formatMessage(messages.viewFolderPage),
    link: { to: '/folders/$slug', params: { slug } },
  });

  return (
    <>
      <LevelManagers users={canModerate ? managers : undefined} />
      {publication_status === 'draft' && (
        <Text as="span" m="0" variant="boMicro" color="coolGrey500">
          {formatMessage(sharedMessages.draft)}
        </Text>
      )}
      <MoreActions entries={entries} align="left" />
      <NewProjectModal
        mode={addingProject ? 'scratch' : null}
        context={{ space_id: folderSpaceId, folder_id: folderId }}
        onClose={() => setAddingProject(false)}
      />
    </>
  );
};

export default FolderLevelActions;
