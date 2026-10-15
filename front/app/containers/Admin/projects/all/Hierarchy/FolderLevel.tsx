import React from 'react';

import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import { PAGE_SIZE } from './constants';
import EmptyLevel from './EmptyLevel';
import ItemLink from './ItemLink';
import LevelError from './LevelError';
import Section from './Section';

interface Props {
  folderId: string;
}

const FolderLevel = ({ folderId }: Props) => {
  const projects = useInfiniteProjectsMiniAdmin(
    { folder_ids: [folderId], sort: 'arranged' },
    PAGE_SIZE
  );

  if (projects.isLoading) return null;
  if (projects.isError) return <LevelError />;

  const projectList = projects.data?.pages.flatMap((page) => page.data) ?? [];
  const projectsCount = projects.data?.pages[0].meta.total ?? 0;

  if (projectsCount === 0) return <EmptyLevel />;

  return (
    <Section count={projectsCount}>
      {projectList.map((project) => (
        <ItemLink
          key={project.id}
          titleMultiloc={project.attributes.title_multiloc}
          target={{ projectId: project.id }}
        />
      ))}
    </Section>
  );
};

export default FolderLevel;
