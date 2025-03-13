import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { ProjectLibraryProjectData } from 'api/project_library_projects/types';
import useInfiniteProjectLibraryProjects from 'api/project_library_projects/useInfiniteProjectLibraryProjects';

import ProjectCard from '../components/ProjectCard';
import { useRansackParams } from '../utils';

const ProjectCards = () => {
  const ransackParams = useRansackParams();
  const { data: projects } = useInfiniteProjectLibraryProjects({
    ...ransackParams,
    'page[size]': 3, // TODO remove
  });

  const flatProjects = useMemo(() => {
    if (!projects) return undefined;
    return projects.pages.map((page) => page.data).flat();
  }, [projects]);

  const projectsInRows = useMemo(() => {
    if (!flatProjects) return [];

    const rows: ProjectLibraryProjectData[][] = [];

    flatProjects.forEach((project, index) => {
      if (index % 3 === 0) {
        rows.push([project]);
      } else {
        rows[rows.length - 1].push(project);
      }
    });

    return rows;
  }, [flatProjects]);

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
