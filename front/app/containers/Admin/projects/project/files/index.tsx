import React, { useState } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import useFiles from 'api/files/useFiles';

import { useParams } from 'utils/router';

import FilesList from './components/FilesList';
import FirstUploadView from './components/FirstUploadView';

type Props = {
  projectHasFiles: boolean;
};
const ProjectFilesTab = ({ projectHasFiles }: Props) => {
  // Note:
  // This state is used to control the current view, so the user is presented
  // with a specific "First Upload" UI view when no files have been uploaded yet, which
  // includes some additional information about the feature.
  // Once the user uploads files AND clicks "Done", this view will change into the full file list view.
  const [showFirstUploadView, setShowFirstUploadView] = useState<boolean>(
    !projectHasFiles
  );

  return (
    <Box mb="40px" p="44px">
      <Box>
        {showFirstUploadView ? (
          <FirstUploadView setShowFirstUploadView={setShowFirstUploadView} />
        ) : (
          <FilesList />
        )}
      </Box>
    </Box>
  );
};

const ProjectFilesTabWrapper = () => {
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId/files',
  });

  // Try to fetch first file of the project, to determine if there are any files.
  const { data: files, isLoading } = useFiles({
    pageNumber: 1,
    pageSize: 1,
    project: [projectId],
  });

  const projectHasFiles = !isLoading && !(files?.data.length === 0);

  if (isLoading) {
    return <Spinner />;
  }

  return <ProjectFilesTab projectHasFiles={projectHasFiles} />;
};

export default ProjectFilesTabWrapper;
