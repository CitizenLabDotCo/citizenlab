import React from 'react';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from './messages';
import FolderRadio from './Radios/FolderRadio';
import RootRadio from './Radios/RootRadio';
import SpaceRadio from './Radios/SpaceRadio';
import { Props } from './types';

const Inner = (props: Props) => {
  const { data: authUser } = useAuthUser();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  if (!authUser) return null;

  const { highest_role } = authUser.data.attributes;

  if (highest_role === 'super_admin' || highest_role === 'admin') {
    return (
      <>
        {spacesEnabled && <SpaceRadio {...props} />}
        <FolderRadio
          {...props}
          descriptionMessage={messages.folderDescriptionChangeLater}
        />
        <RootRadio
          {...props}
          descriptionMessage={
            spacesEnabled
              ? messages.rootDescriptionChangeLater
              : messages.rootDescriptionChangeLaterNoSpaces
          }
        />
      </>
    );
  }

  if (highest_role === 'space_moderator') {
    return (
      <>
        {spacesEnabled && <SpaceRadio {...props} />}
        <FolderRadio
          {...props}
          descriptionMessage={messages.folderDescriptionChangeLater}
        />
        <RootRadio
          {...props}
          descriptionMessage={messages.rootDescriptionSMs}
        />
      </>
    );
  }

  if (highest_role === 'project_folder_moderator') {
    return (
      <>
        <FolderRadio
          {...props}
          descriptionMessage={messages.folderDescriptionChangeLater}
        />
        <RootRadio
          {...props}
          descriptionMessage={messages.rootDescriptionFMs}
        />
      </>
    );
  }

  return null;
};

export default Inner;
