import React from 'react';

import { ProjectsMiniAdmin } from 'api/projects_mini_admin/types';

import { PagedQuery } from '../levelGroups';
import useProjectPath from '../useProjectPath';

import CardGrid from './CardGrid';
import LoadMore from './LoadMore';
import ProjectCard from './ProjectCard';


interface Props {
  query: PagedQuery<ProjectsMiniAdmin>;
  // At the top level, projects can sit anywhere, so each card says where.
  showPath?: boolean;
}

const ProjectCards = ({ query, showPath = false }: Props) => {
  const pathOf = useProjectPath();
  const projects = query.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <CardGrid>
        {projects.map((project) => {
          const path = showPath ? pathOf(project) : undefined;

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
