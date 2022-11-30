import React from 'react';

import ProjectCard from 'components/ProjectCard';

const ProjectsList = (projects) => {
  return projects.map((project) => {
    return (
      <ProjectCard projectId={projectOrFolderId} size={size} layout={layout} />
    );
  });
};

export default ProjectsList;
