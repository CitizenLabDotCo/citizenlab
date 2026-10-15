import React from 'react';

import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import { PAGE_SIZE } from './constants';
import EmptyLevel from './EmptyLevel';
import LevelError from './LevelError';
import LevelView from './LevelView';
import useProjectSort from './useProjectSort';

interface Props {
  folderId: string;
}

const FolderLevel = ({ folderId }: Props) => {
  const sort = useProjectSort();
  const projects = useInfiniteProjectsMiniAdmin(
    { folder_ids: [folderId], sort },
    PAGE_SIZE
  );

  if (projects.isLoading) return null;
  if (projects.isError) return <LevelError />;

  const projectsCount = projects.data?.pages[0].meta.total ?? 0;

  if (projectsCount === 0) return <EmptyLevel />;

  return (
    <LevelView
      groups={[
        {
          kind: 'projects',
          count: projectsCount,
          arrangeable: sort === 'arranged',
          query: projects,
        },
      ]}
    />
  );
};

export default FolderLevel;
