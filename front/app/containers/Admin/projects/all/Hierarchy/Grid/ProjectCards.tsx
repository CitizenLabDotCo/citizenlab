import React from 'react';

import { ProjectsMiniAdmin } from 'api/projects_mini_admin/types';

import useArrangeGroup, {
  ArrangeGroupContext,
} from '../Arrange/useArrangeGroup';
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
  const { shown, placeOf, group } = useArrangeGroup({
    kind: 'project',
    items: projects,
    hasMore: query.hasNextPage,
    arrangeable,
  });

  return (
    <>
      <ArrangeGroupContext.Provider value={group}>
        <CardGrid>
          {shown.map((project) => {
            const path = pathFrom && pathOf(project, pathFrom);

            return (
              <ProjectCard
                key={project.id}
                project={project}
                path={path}
                place={placeOf(project)}
              />
            );
          })}
        </CardGrid>
      </ArrangeGroupContext.Provider>
      <LoadMore
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};

export default ProjectCards;
