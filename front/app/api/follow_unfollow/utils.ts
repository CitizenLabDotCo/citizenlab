import { QueryClient } from '@tanstack/react-query';
import projectsKeys from 'api/projects/keys';
import ideasKeys from 'api/ideas/keys';
import initiativesKeys from 'api/initiatives/keys';
import projectFoldersKeys from 'api/project_folders/keys';
import topicsKeys from 'api/topics/keys';
import areasKeys from 'api/areas/keys';
import followUnfollowKeys from './keys';
import { FollowableType } from './types';
import meKeys from 'api/me/keys';

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
    case 'initiatives':
      queryClient.invalidateQueries(initiativesKeys.item({ id: followableId }));
      break;
    case 'project_folders':
      queryClient.invalidateQueries(
        projectFoldersKeys.item({ slug: followableSlug })
      );
      break;
    case 'topics':
      queryClient.invalidateQueries(topicsKeys.list({}));
      break;
    case 'areas':
      queryClient.invalidateQueries(areasKeys.list({}));
      break;
    default:
      break;
  }
};
