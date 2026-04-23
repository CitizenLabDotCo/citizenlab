import React from 'react';

import useProjectFolders from 'api/project_folders/useProjectFolders';

import SpaceSelectSection from 'components/admin/SpaceSelectSection';

import { Props } from './types';

const AdminInterface = ({ space_id, folder_id }: Props) => {
  const { data: folders } = useProjectFolders();

  return (
    <SpaceSelectSection
      spaceId={space_id || null}
      isProjectInsideFolder={!!folder_id}
      onChange={() => {}}
    />
  );
};

export default AdminInterface;
