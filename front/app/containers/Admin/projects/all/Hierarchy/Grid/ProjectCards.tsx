import React from 'react';

import { InfiniteData } from '@tanstack/react-query';

import { ProjectsMiniAdmin } from 'api/projects_mini_admin/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import CardGrid from './CardGrid';
import LoadMore from './LoadMore';
import ProjectCard from './ProjectCard';

interface Props {
  query: {
    data?: InfiniteData<ProjectsMiniAdmin>;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
  };
  // At the top level, projects can sit anywhere, so each card says where.
  showPath?: boolean;
}

const ProjectCards = ({ query, showPath = false }: Props) => {
  const localize = useLocalize();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const projects = query.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <CardGrid>
        {projects.map((project) => {
          const { space_title_multiloc, folder_title_multiloc } =
            project.attributes;
          const path = showPath
            ? [spacesEnabled && space_title_multiloc, folder_title_multiloc]
                .flatMap((title) => (title ? [localize(title)] : []))
                .join(' › ')
            : undefined;

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
