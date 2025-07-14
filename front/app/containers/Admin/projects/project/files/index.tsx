import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useFiles from 'api/files/useFiles';

import FilesList from './components/FilesList';
import NoFilesView from './components/NoFilesView';

const ProjectFilesTab = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const [showInitialView, setShowInitialView] = useState<boolean>(false);

  const { data: files } = useFiles({
    pageNumber: 1,
    pageSize: 1,
    project: [projectId],
  });

  const projectHasFiles = !(files?.data.length === 0);

  return (
    <Box mb="40px" p="44px">
      <Box>
        {!projectHasFiles || showInitialView ? (
          <NoFilesView setShowInitialView={setShowInitialView} />
        ) : (
          <FilesList />
        )}
      </Box>
    </Box>
  );
};

export default ProjectFilesTab;
