import React from 'react';

import useProjectById from 'api/projects/useProjectById';
import useUpdateProject from 'api/projects/useUpdateProject';

import ListingStatusToggle from '../../general/components/ListingStatusToggle';

interface Props {
  projectId: string;
}

const ProjectUnlisted = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { mutate: updateProject } = useUpdateProject();

  if (!project) {
    return null;
  }

  const { listed } = project.data.attributes;

  return (
    <ListingStatusToggle
      listed={listed}
      onChange={() => {
        updateProject({ projectId, listed: !listed });
      }}
    />
  );
};

export default ProjectUnlisted;
