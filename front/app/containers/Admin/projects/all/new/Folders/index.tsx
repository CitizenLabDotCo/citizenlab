import React from 'react';

import useProjectFoldersAdmin from 'api/project_folders/useProjectFoldersAdmin';

const Folders = () => {
  const { data } = useProjectFoldersAdmin({});

  console.log({ data });

  return <>Folders!</>;
};

export default Folders;
