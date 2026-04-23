import React from 'react';

import useAuthUser from 'api/me/useAuthUser';

const FolderAndSpaceSelectSection = () => {
  const { data: authUser } = useAuthUser();
  if (!authUser) return null;

  const { highest_role } = authUser.data.attributes;

  if (highest_role === 'admin') {
    return <></>;
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
