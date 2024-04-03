import React from 'react';

import { Outlet as RouterOutlet, useParams } from 'react-router-dom';

import ProjectHeader from './projectHeader';

const AdminProjectsProjectIndex = () => {
  const { projectId } = useParams() as { projectId: string };
  return (
    <>
      <ProjectHeader projectId={projectId} />
      <RouterOutlet />
    </>
  );
};

export default AdminProjectsProjectIndex;
