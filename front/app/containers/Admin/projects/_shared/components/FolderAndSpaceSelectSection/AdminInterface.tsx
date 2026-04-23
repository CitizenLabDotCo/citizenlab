import React from 'react';

import { fragmentId as folderFragmentId } from 'containers/Admin/projects/project/projectHeader/FolderProjectDropdown';

import SpaceSelectSection from 'components/admin/SpaceSelectSection';
import Highlighter from 'components/Highlighter';

import ProjectFolderSelect from '../ProjectSetupForm/ProjectFolderSelect';

import { Props } from './types';

const AdminInterface = ({ space_id, folder_id, onChange }: Props) => {
  return (
    <>
      <Highlighter fragmentId={folderFragmentId}>
        <ProjectFolderSelect
          folder_id={folder_id}
          onChange={(folder_id) => {
            if (folder_id) {
              // If a folder is chosen, the project will automatically
              // inherit the folder's space. So we clear
              // any previously chosen space.
              onChange({ folder_id, space_id: undefined });
            } else {
              onChange({ folder_id, space_id });
            }
          }}
        />
      </Highlighter>

      <SpaceSelectSection
        spaceId={space_id}
        folderId={folder_id}
        onChange={(space_id) => {
          onChange({ folder_id, space_id });
        }}
      />
    </>
  );
};

export default AdminInterface;
