import { InfiniteData } from '@tanstack/react-query';

import { MiniProjectFolders } from 'api/project_folders_mini/types';
import { ProjectsMiniAdmin } from 'api/projects_mini_admin/types';
import { Spaces } from 'api/spaces/types';

import { PathFrom } from './useProjectPath';

export type PagedQuery<T> = {
  data?: InfiniteData<T>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
};

// One group of a level, as both the grid and the list show it. A group
// without a label is the only thing on its level. An arrangeable group shows
// its items in the order they're kept in, and they all sit side by side, so
// they can be moved among each other.
export type LevelGroup = {
  label?: string;
  count: number;
  arrangeable: boolean;
} & (
  | { kind: 'spaces'; spaces: Spaces }
  | { kind: 'folders'; query: PagedQuery<MiniProjectFolders> }
  | {
      kind: 'projects';
      query: PagedQuery<ProjectsMiniAdmin>;
      // Where each project's path starts. From the top, a project can sit
      // anywhere; inside a space, the path is just its folder.
      pathFrom?: PathFrom;
    }
);
