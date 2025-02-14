import React from 'react';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

const ProjectLibrary = () => {
  const { data: libraryProjects } = useProjectLibraryProjects({});

  return (
    <div>
      <h1>Project Library</h1>
      <ul>
        {libraryProjects?.data.map((project) => (
          <li key={project.id}>{project.attributes.title_en}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectLibrary;
