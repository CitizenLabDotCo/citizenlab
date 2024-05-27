import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useProjects } from 'api/graph_data_units';

import { Props } from '../typings';

import ProjectRow from './ProjectRow';

const ProjectsCard = ({ startAt, endAt }: Props) => {
  const { data: response } = useProjects({ start_at: startAt, end_at: endAt });

  return (
    <Box>
      {response?.data.attributes.projects.map((project, i) => {
        const imageId = project.relationships.project_images?.data[0]?.id;
        const projectImage = imageId
          ? response.data.attributes.project_images[imageId]
          : undefined;

        return (
          <ProjectRow
            key={project.id}
            project={project}
            projectImage={projectImage}
            first={i === 0}
          />
        );
      })}
    </Box>
  );
};

export default ProjectsCard;
