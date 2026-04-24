import React from 'react';

import { Box, Radio } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useSpaces from 'api/spaces/useSpaces';
import { HighestRole } from 'api/users/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { fragmentId as folderFragmentId } from 'containers/Admin/projects/project/projectHeader/FolderProjectDropdown';

import { SubSectionTitle } from 'components/admin/Section';
import SpaceSelect from 'components/admin/SpaceSelectSection/SpaceSelect';
import Highlighter from 'components/Highlighter';

import { FormattedMessage } from 'utils/cl-intl';

import { LabelHeaderDescription } from '../../labels';

import messages from './messages';
import ProjectFolderSelect from './ProjectFolderSelect';
import { Props } from './types';

const ROLES_THAT_CAN_SEE_SPACES: (string | undefined)[] = [
  'super_admin',
  'admin',
  'project_moderator',
] satisfies HighestRole[];

const ProjectContextSection = ({
  projectContext,
  space_id,
  folder_id,
  onSetContext,
  onChangeSpace,
  onChangeFolder,
}: Props) => {
  const { data: authUser } = useAuthUser();
  const { data: spaces } = useSpaces();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  if (!authUser || !spaces) return null;

  const { highest_role } = authUser.data.attributes;

  const canSeeSpaces =
    spacesEnabled && ROLES_THAT_CAN_SEE_SPACES.includes(highest_role);

  const getFolderDescriptionMessage = () => {
    if (highest_role === 'project_folder_moderator') {
      return messages.folderDescriptioChangeLaterExceptRoot;
    }

    return messages.folderDescriptionChangeLater;
  };

  const getRootDescriptionMessage = () => {
    if (
      highest_role === 'space_moderator' ||
      highest_role === 'project_folder_moderator'
    ) {
      return messages.rootDescriptionPMsAndFMs;
    }

    return messages.rootDescriptionChangeLater;
  };

  return (
    <Box mb="40px">
      <SubSectionTitle>
        <FormattedMessage {...messages.projectContext} />
      </SubSectionTitle>
      {canSeeSpaces && (
        <>
          <Radio
            name="space"
            value="space"
            currentValue={projectContext}
            label={
              <LabelHeaderDescription
                header={<FormattedMessage {...messages.space} />}
                description={
                  <FormattedMessage {...messages.spaceDescriptionChangeLater} />
                }
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
            header={<FormattedMessage {...messages.folder} />}
            description={
              <FormattedMessage {...getFolderDescriptionMessage()} />
            }
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
            header={<FormattedMessage {...messages.root} />}
            description={<FormattedMessage {...getRootDescriptionMessage()} />}
          />
        }
        onChange={() => onSetContext('root')}
      />
    </Box>
  );
};

export default ProjectContextSection;
