import React from 'react';

import { fragmentId as folderFragmentId } from 'containers/Admin/projects/project/projectHeader/FolderProjectDropdown';

import Highlighter from 'components/Highlighter';

import ProjectFolderSelect from '../../ProjectSetupForm/ProjectFolderSelect';
import { BaseProps } from '../types';

const ExistingProject = ({ folder_id, onChange }: BaseProps) => {
  return (
    <Highlighter fragmentId={folderFragmentId}>
      <ProjectFolderSelect
        folder_id={folder_id}
        onChange={(folder_id) => {
          onChange({ folder_id, space_id: undefined });
        }}
      />
    </Highlighter>
  );
};

export default ExistingProject;
