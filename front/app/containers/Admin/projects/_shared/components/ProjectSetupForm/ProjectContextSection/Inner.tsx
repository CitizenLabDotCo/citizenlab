import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { fragmentId as folderFragmentId } from 'containers/Admin/projects/project/projectHeader/FolderProjectDropdown';

import Highlighter from 'components/Highlighter';

import messages from './messages';
import ProjectFolderSelect from './ProjectFolderSelect';
import FolderRadio from './Radios/FolderRadio';
import RootRadio from './Radios/RootRadio';
import SpaceRadio from './Radios/SpaceRadio';
import { Props, FormSituation } from './types';

const Inner = (props: Props & { formSituation: FormSituation }) => {
  const { data: authUser } = useAuthUser();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  if (!authUser) return null;

  const { highest_role } = authUser.data.attributes;
  const { formSituation } = props;

  if (formSituation === 'creating') {
    if (highest_role === 'space_moderator') {
      return (
        <>
          <SpaceRadio {...props} />
          <FolderRadio {...props} />
          <RootRadio
            {...props}
            descriptionMessage={messages.rootDescriptionCreateWithSpaces}
          />
        </>
      );
    }

    if (highest_role === 'project_folder_moderator') {
      return (
        <>
          <SpaceRadio {...props} />
          <FolderRadio {...props} />
          <RootRadio
            {...props}
            descriptionMessage={
              spacesEnabled
                ? messages.rootDescriptionCreateWithSpaces
                : messages.rootDescriptionCreateWithoutSpaces
            }
          />
        </>
      );
    }
  }

  if (formSituation === 'editing-project-not-in-root') {
    if (highest_role === 'space_moderator') {
      return (
        <>
          <SpaceRadio {...props} />
          <FolderRadio {...props} />
        </>
      );
    }

    if (highest_role === 'project_folder_moderator') {
      return (
        <>
          <Box mb="40px">
            <Highlighter fragmentId={folderFragmentId}>
              <ProjectFolderSelect
                folder_id={props.folder_id}
                onChange={(folder_id) => {
                  props.onChangeFolder(folder_id);
                }}
              />
            </Highlighter>
          </Box>
        </>
      );
    }
  }

  return (
    <>
      {spacesEnabled && <SpaceRadio {...props} />}
      <FolderRadio {...props} />
      <RootRadio
        {...props}
        descriptionMessage={
          spacesEnabled
            ? messages.rootDescriptionWithSpaces
            : messages.rootDescriptionWithoutSpaces
        }
      />
    </>
  );
};

export default Inner;
