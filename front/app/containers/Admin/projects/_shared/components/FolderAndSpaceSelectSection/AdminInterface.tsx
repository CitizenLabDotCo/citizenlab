import React from 'react';

import useProjectFolders from 'api/project_folders/useProjectFolders';

const AdminInterface = () => {
  const { data: folders } = useProjectFolders();

  return <></>;
};

export default AdminInterface;
