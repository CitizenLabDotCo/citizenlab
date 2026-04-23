import React from 'react';

import useAuthUser from 'api/me/useAuthUser';
import { HighestRole } from 'api/users/types';

import { fragmentId as folderFragmentId } from 'containers/Admin/projects/project/projectHeader/FolderProjectDropdown';

import SpaceSelectSection from 'components/admin/SpaceSelectSection';
import Highlighter from 'components/Highlighter';

import ProjectFolderSelect from '../ProjectSetupForm/ProjectFolderSelect';

import { Props } from './types';

const FOLDER_SELECT_ALLOWED_HIGHEST_ROLES: (string | undefined)[] = [
  'super_admin',
  'admin',
  'space_moderator',
  'project_folder_moderator',
] satisfies HighestRole[];

const AdminInterface = ({ space_id, folder_id }: Props) => {
  const { data: authUser } = useAuthUser();

  const showProjectFolderSelect = FOLDER_SELECT_ALLOWED_HIGHEST_ROLES.includes(
    authUser?.data.attributes.highest_role
  );

  return (
    <>
      {showProjectFolderSelect && (
        <Highlighter fragmentId={folderFragmentId}>
          <ProjectFolderSelect
            folder_id={folder_id}
            onChange={(folder_id) => {
              if (folder_id) {
                // If a folder is chosen, the project will automatically
                // inherit the folder's space. So we clear
                // any previously chosen space.
                handleProjectAttributeDiffOnChange(
                  { folder_id, space_id: undefined },
                  'enabled'
                );
              } else {
                handleProjectAttributeDiffOnChange({ folder_id }, 'enabled');
              }
            }}
          />
        </Highlighter>
      )}
      <SpaceSelectSection
        spaceId={space_id}
        folderId={folder_id}
        onChange={() => {}}
      />
    </>
  );
};

export default AdminInterface;
