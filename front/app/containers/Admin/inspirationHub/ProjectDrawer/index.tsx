import React from 'react';

import { useSearchParams } from 'react-router-dom';

import useProjectLibraryProject from 'api/project_library_projects/useProjectLibraryProject';

import SideModal from 'components/UI/SideModal';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

const ProjectDrawer = () => {
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get('project_id') ?? undefined;
  const { data: project } = useProjectLibraryProject(projectId);

  const handleOnClose = () => {
    removeSearchParams(['project_id']);
  };

  console.log({ project });

  return (
    <SideModal opened={!!projectId} close={handleOnClose}>
      TODO
    </SideModal>
  );
};

export default ProjectDrawer;
