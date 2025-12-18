import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useProjects } from 'api/graph_data_units';

import useLocale from 'hooks/useLocale';

import { Props } from '../typings';

import ProjectRow from './ProjectRow';

const ProjectsCard = ({
  startAt,
  endAt,
  publicationStatuses,
  sort,
  excludedProjectIds,
  excludedFolderIds,
}: Props) => {
  const locale = useLocale();
  const { data: response } = useProjects({
    start_at: startAt,
    end_at: endAt,
    publication_statuses: publicationStatuses,
    excluded_project_ids: excludedProjectIds,
    excluded_folder_ids: excludedFolderIds,
    sort,
    locale,
  });
  if (!response) return null;

  return (
    <Box>
      {response.data.attributes.projects.map((project) => {
        const imageId = project.relationships.project_images?.data[0]?.id;
        const projectImage = imageId
          ? // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            response?.data.attributes.project_images[imageId]
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
