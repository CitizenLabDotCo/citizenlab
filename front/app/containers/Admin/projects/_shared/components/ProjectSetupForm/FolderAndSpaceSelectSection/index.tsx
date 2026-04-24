import React from 'react';

import { Box, Radio } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useSpaces from 'api/spaces/useSpaces';
import { HighestRole } from 'api/users/types';

import { fragmentId as folderFragmentId } from 'containers/Admin/projects/project/projectHeader/FolderProjectDropdown';

import { SubSectionTitle } from 'components/admin/Section';
import SpaceSelect from 'components/admin/SpaceSelectSection/SpaceSelect';
import Highlighter from 'components/Highlighter';

import { LabelHeaderDescription } from '../../labels';
import ProjectFolderSelect from '../ProjectFolderSelect';

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
  const { data: spaces } = useSpaces();
  if (!authUser || !spaces) return null;

  const { highest_role } = authUser.data.attributes;

  return (
    <Box mb="40px">
      <SubSectionTitle>Project context (TODO)</SubSectionTitle>
      {ROLES_THAT_CAN_SEE_SPACES.includes(highest_role) && (
        <>
          <Radio
            name="space"
            value="space"
            currentValue={projectContext}
            label={
              <LabelHeaderDescription
                header={<>Space</>}
                description={<>Description</>}
              />
            }
            onChange={() => onSetContext('space')}
            mb="12px"
          />
          {projectContext === 'space' && (
            <Box mb="40px">
              <SpaceSelect
                spaceId={space_id}
                spaces={spaces.data}
                onChange={(space_id) => {
                  onChangeSpace(space_id);
                }}
              />
            </Box>
          )}
        </>
      )}
      <Radio
        name="folder"
        value="folder"
        currentValue={projectContext}
        label={
          <LabelHeaderDescription
            header={<>Folder</>}
            description={<>Description</>}
          />
        }
        onChange={() => onSetContext('folder')}
        mb="12px"
      />
      {projectContext === 'folder' && (
        <Box mb="40px">
          <Highlighter fragmentId={folderFragmentId}>
            <ProjectFolderSelect
              folder_id={folder_id}
              onChange={(folder_id) => {
                onChangeFolder(folder_id);
              }}
            />
          </Highlighter>
        </Box>
      )}
      <Radio
        name="root"
        value="root"
        currentValue={projectContext}
        label={
          <LabelHeaderDescription
            header={<>Root</>}
            description={
              <>
                Project will not be in any folder or space. This can be changed
                later.
              </>
            }
          />
        }
        onChange={() => onSetContext('root')}
      />
    </Box>
  );
};

export default FolderAndSpaceSelectSection;
