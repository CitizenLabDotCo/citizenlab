import React from 'react';

import { ProjectsMiniAdmin } from 'api/projects_mini_admin/types';

import { placesIn } from '../Arrange/arrangeTargets';
import { PagedQuery } from '../levelGroups';
import useProjectPath, { PathFrom } from '../useProjectPath';

import CardGrid from './CardGrid';
import LoadMore from './LoadMore';
import ProjectCard from './ProjectCard';

interface Props {
  query: PagedQuery<ProjectsMiniAdmin>;
  pathFrom?: PathFrom;
  arrangeable: boolean;
}

const ProjectCards = ({ query, pathFrom, arrangeable }: Props) => {
  const pathOf = useProjectPath();
  const projects = query.data?.pages.flatMap((page) => page.data) ?? [];
  const placeAt = arrangeable
    ? placesIn(projects, query.hasNextPage)
    : undefined;

  return (
    <>
      <CardGrid>
        {projects.map((project, index) => {
          const path = pathFrom && pathOf(project, pathFrom);

          return (
            <ProjectCard
              key={project.id}
              project={project}
              path={path}
              place={placeAt?.(index)}
            />
          );
        })}
      </CardGrid>
      <LoadMore
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};

export default ProjectCards;
