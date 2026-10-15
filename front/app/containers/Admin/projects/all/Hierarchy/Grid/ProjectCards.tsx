import React from 'react';

import { ProjectsMiniAdmin } from 'api/projects_mini_admin/types';

import { PagedQuery } from '../levelGroups';
import useProjectPath, { PathFrom } from '../useProjectPath';

import CardGrid from './CardGrid';
import LoadMore from './LoadMore';
import ProjectCard from './ProjectCard';

interface Props {
  query: PagedQuery<ProjectsMiniAdmin>;
  pathFrom?: PathFrom;
}

const ProjectCards = ({ query, pathFrom }: Props) => {
  const pathOf = useProjectPath();
  const projects = query.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <CardGrid>
        {projects.map((project) => {
          const path = pathFrom && pathOf(project, pathFrom);

          return <ProjectCard key={project.id} project={project} path={path} />;
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
