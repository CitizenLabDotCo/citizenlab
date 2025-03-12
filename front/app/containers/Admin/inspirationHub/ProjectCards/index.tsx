import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { ProjectLibraryProjectData } from 'api/project_library_projects/types';
import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import ProjectCard from '../components/ProjectCard';
import { useRansackParams } from '../utils';

const ProjectCards = () => {
  const ransackParams = useRansackParams();
  const { data: projects } = useProjectLibraryProjects(ransackParams);

  const projectsInRows = useMemo(() => {
    if (!projects) return [];

    const rows: ProjectLibraryProjectData[][] = [];

    projects.data.forEach((project, index) => {
      if (index % 3 === 0) {
        rows.push([project]);
      } else {
        rows[rows.length - 1].push(project);
      }
    });

    return rows;
  }, [projects]);

  return (
    <Box>
      {projectsInRows.map((row, i) => (
        <Box display="flex" flexDirection="row" gap="12px" key={i} mb="12px">
          {row.map((project) => (
            <ProjectCard project={project} key={project.id} />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default ProjectCards;
