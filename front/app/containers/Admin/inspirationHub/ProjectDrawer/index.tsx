import React from 'react';

import { useSearchParams } from 'react-router-dom';

import SideModal from 'components/UI/SideModal';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

const ProjectDrawer = () => {
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get('project_id');

  const handleOnClose = () => {
    removeSearchParams(['project_id']);
  };

  return (
    <SideModal opened={!!projectId} close={handleOnClose}>
      TODO
    </SideModal>
  );
};

export default ProjectDrawer;
