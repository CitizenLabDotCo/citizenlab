import { QueryClient } from '@tanstack/react-query';

import areasKeys from 'api/areas/keys';
import globalTopicsKeys from 'api/global_topics/keys';
import ideasKeys from 'api/ideas/keys';
import meKeys from 'api/me/keys';
import projectFoldersKeys from 'api/project_folders/keys';
import projectsKeys from 'api/projects/keys';
import miniProjectsKeys from 'api/projects_mini/keys';

import followUnfollowKeys from './keys';
import { FollowableType } from './types';

export const invalidateFollowQueries = (
  queryClient: QueryClient,
  followableType: FollowableType,
  followableId: string,
  followableSlug?: string
) => {
  queryClient.invalidateQueries({ queryKey: followUnfollowKeys.all() });
  queryClient.invalidateQueries({ queryKey: meKeys.all() });
  switch (followableType) {
    case 'projects':
      queryClient.invalidateQueries(projectsKeys.item({ id: followableId }));
      break;
    case 'ideas':
      queryClient.invalidateQueries(ideasKeys.item({ id: followableId }));
      break;
    case 'project_folders':
      queryClient.invalidateQueries(
        projectFoldersKeys.item({ slug: followableSlug })
      );
      break;
    case 'global_topics':
      queryClient.invalidateQueries(globalTopicsKeys.list({}));
      break;
    case 'areas':
      queryClient.invalidateQueries(areasKeys.lists());
      queryClient.invalidateQueries(
        miniProjectsKeys.list({ endpoint: 'for_areas' })
      );
      break;
    default:
      break;
  }
};
