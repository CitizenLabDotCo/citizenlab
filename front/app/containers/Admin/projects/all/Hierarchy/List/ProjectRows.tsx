import React from 'react';

import useParticipantCounts from 'api/participant_counts/useParticipantCounts';
import { ProjectsMiniAdmin } from 'api/projects_mini_admin/types';

import { PagedQuery } from '../levelGroups';
import useProjectPath, { PathFrom } from '../useProjectPath';

import { ColumnKey } from './columns';
import ProjectRow from './ProjectRow';
import useManagers from './useManagers';

interface Props {
  query: PagedQuery<ProjectsMiniAdmin>;
  columns: ColumnKey[];
  pathFrom?: PathFrom;
}

const ProjectRows = ({ query, columns, pathFrom }: Props) => {
  const pathOf = useProjectPath();
  const pages = query.data?.pages ?? [];
  const projects = pages.flatMap((page) => page.data);
  const managersOf = useManagers(pages.flatMap((page) => page.included ?? []));
  const participants = useParticipantCounts(
    projects.map((project) => project.id)
  );

  return (
    <>
      {projects.map((project) => {
        const path = pathFrom && pathOf(project, pathFrom);

        return (
          <ProjectRow
            key={project.id}
            project={project}
            columns={columns}
            managers={managersOf(project.relationships.moderators.data)}
            participants={participants[project.id]}
            path={path}
          />
        );
      })}
    </>
  );
};

export default ProjectRows;
