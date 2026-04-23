import React from 'react';

import useAuthUser from 'api/me/useAuthUser';

import AdminInterface from './AdminInterface';
import { Props } from './types';

const FolderAndSpaceSelectSection = (props: Props) => {
  const { data: authUser } = useAuthUser();
  if (!authUser) return null;

  const { highest_role } = authUser.data.attributes;

  if (highest_role === 'admin') {
    return <AdminInterface {...props} />;
  }

  if (highest_role === 'space_moderator') {
    return <></>;
  }

  if (highest_role === 'project_folder_moderator') {
    return <></>;
  }

  return null;
};

export default FolderAndSpaceSelectSection;
