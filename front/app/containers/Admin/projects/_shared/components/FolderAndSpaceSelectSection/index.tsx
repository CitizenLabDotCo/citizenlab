import React from 'react';

import { Radio, Text } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { HighestRole } from 'api/users/types';

import { fragmentId as folderFragmentId } from 'containers/Admin/projects/project/projectHeader/FolderProjectDropdown';

import SpaceSelectSection from 'components/admin/SpaceSelectSection';
import Highlighter from 'components/Highlighter';

import ProjectFolderSelect from '../ProjectSetupForm/ProjectFolderSelect';

import { Props } from './types';

const ROLES_THAT_CAN_SEE_SPACES: (string | undefined)[] = [
  'super_admin',
  'admin',
  'project_moderator',
] satisfies HighestRole[];

const FolderAndSpaceSelectSection = ({
  projectContext,
  space_id,
  folder_id,
  onSetContext,
  onChangeSpace,
  onChangeFolder,
}: Props) => {
  const { data: authUser } = useAuthUser();
  if (!authUser) return null;

  const { highest_role } = authUser.data.attributes;

  return (
    <>
      {ROLES_THAT_CAN_SEE_SPACES.includes(highest_role) && (
        <>
          <Radio
            name="space"
            value="space"
            currentValue={projectContext}
            label={<Text>Space TODO</Text>}
            onChange={() => onSetContext('space')}
          />
          {projectContext === 'space' && (
            <SpaceSelectSection
              spaceId={space_id}
              folderId={folder_id}
              onChange={(space_id) => {
                if (!space_id) return;
                onChangeSpace(space_id);
              }}
            />
          )}
        </>
      )}
      <Radio
        name="folder"
        value="folder"
        currentValue={projectContext}
        label={<Text>Folder TODO</Text>}
        onChange={() => onSetContext('folder')}
      />
      {projectContext === 'folder' && (
        <Highlighter fragmentId={folderFragmentId}>
          <ProjectFolderSelect
            folder_id={folder_id}
            onChange={(folder_id) => {
              onChangeFolder(folder_id);
            }}
          />
        </Highlighter>
      )}
      <Radio
        name="root"
        value="root"
        currentValue={projectContext}
        label={<Text>Root TODO</Text>}
        onChange={() => onSetContext('root')}
      />
    </>
  );
};

export default FolderAndSpaceSelectSection;
