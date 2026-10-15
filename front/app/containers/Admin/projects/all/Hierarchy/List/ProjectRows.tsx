import React from 'react';

import useParticipantCounts from 'api/participant_counts/useParticipantCounts';
import { ProjectsMiniAdmin } from 'api/projects_mini_admin/types';

import { placesIn } from '../Arrange/arrangeTargets';
import { PagedQuery } from '../levelGroups';
import useProjectPath, { PathFrom } from '../useProjectPath';

import { ColumnKey } from './columns';
import ProjectRow from './ProjectRow';
import useManagers from './useManagers';

interface Props {
  query: PagedQuery<ProjectsMiniAdmin>;
  columns: ColumnKey[];
  pathFrom?: PathFrom;
  arrangeable: boolean;
}

const ProjectRows = ({ query, columns, pathFrom, arrangeable }: Props) => {
  const pathOf = useProjectPath();
  const pages = query.data?.pages ?? [];
  const projects = pages.flatMap((page) => page.data);
  const managersOf = useManagers(pages.flatMap((page) => page.included ?? []));
  const participants = useParticipantCounts(
    projects.map((project) => project.id)
  );
  const placeAt = arrangeable
    ? placesIn(projects, query.hasNextPage)
    : undefined;

  return (
    <>
      {projects.map((project, index) => {
        const path = pathFrom && pathOf(project, pathFrom);

        return (
          <ProjectRow
            key={project.id}
            project={project}
            columns={columns}
            managers={managersOf(project.relationships.moderators.data)}
            participants={participants[project.id]}
            path={path}
            place={placeAt?.(index)}
          />
        );
      })}
    </>
  );
};

export default ProjectRows;
