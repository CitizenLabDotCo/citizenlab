import React from 'react';

import useProjectById from 'api/projects/useProjectById';

import { useParams } from 'utils/router';

import ProjectPageForm from '../ProjectPageForm';

const NewProjectPage = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: project } = useProjectById(projectId);

  if (!project) {
    return null;
  }

  return <ProjectPageForm project={project.data} />;
};

export default NewProjectPage;
