import { InfiniteData } from '@tanstack/react-query';

import { MiniProjectFolders } from 'api/project_folders_mini/types';
import { ProjectsMiniAdmin } from 'api/projects_mini_admin/types';
import { Spaces } from 'api/spaces/types';

export type PagedQuery<T> = {
  data?: InfiniteData<T>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
};

// One group of a level, as both the grid and the list show it. A group
// without a label is the only thing on its level.
export type LevelGroup = { label?: string; count: number } & (
  | { kind: 'spaces'; spaces: Spaces }
  | { kind: 'folders'; query: PagedQuery<MiniProjectFolders> }
  | {
      kind: 'projects';
      query: PagedQuery<ProjectsMiniAdmin>;
      // At the top level, projects can sit anywhere, so each says where.
      showPath?: boolean;
    }
);
