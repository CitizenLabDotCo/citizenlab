import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useProjects } from 'api/graph_data_units';

import { Props } from '../typings';

import ProjectRow from './ProjectRow';

const ProjectsCard = ({ startAt, endAt }: Props) => {
  const { data: response } = useProjects({ start_at: startAt, end_at: endAt });

  const publishedProjects = response?.data.attributes.projects.filter(
    (project) => {
      return project.attributes.publication_status === 'published';
    }
  );

  if (!publishedProjects || !response) return null;

  return (
    <Box>
      {publishedProjects?.map((project) => {
        const imageId = project.relationships.project_images?.data[0]?.id;
        const projectImage = imageId
          ? response?.data.attributes.project_images[imageId]
          : undefined;

        const period = response.data.attributes.periods[project.id];

        const participants = response.data.attributes.participants[project.id];

        return (
          <ProjectRow
            key={project.id}
            project={project}
            projectImage={projectImage}
            period={period}
            participants={participants}
          />
        );
      })}
    </Box>
  );
};

export default ProjectsCard;
