import React from 'react';

import useProjectById from 'api/projects/useProjectById';
import useUpdateProject from 'api/projects/useUpdateProject';

import ProjectDiscoverabilityRadios from '../../general/components/ProjectDiscoverabilityRadios';

interface Props {
  projectId: string;
}

const ProjectDiscoverability = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { mutate: updateProject } = useUpdateProject();

  if (!project) {
    return null;
  }

  const { listed } = project.data.attributes;

  return (
    <ProjectDiscoverabilityRadios
      listed={listed}
      onChange={() => {
        updateProject({ projectId, listed: !listed });
      }}
    />
  );
};

export default ProjectDiscoverability;
