import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useProjectLibraryProject from 'api/project_library_projects/useProjectLibraryProject';

import SideModal from 'components/UI/SideModal';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import Header from './Header';

const ProjectDrawer = () => {
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get('project_id') ?? undefined;
  const { data: project } = useProjectLibraryProject(projectId);

  const handleOnClose = () => {
    removeSearchParams(['project_id']);
  };

  const attributes = project?.data.attributes;

  return (
    <SideModal opened={!!project && !!projectId} close={handleOnClose}>
      {attributes && (
        <Box mt="52px" mx="28px">
          <Header attributes={attributes} />
        </Box>
      )}
    </SideModal>
  );
};

export default ProjectDrawer;
