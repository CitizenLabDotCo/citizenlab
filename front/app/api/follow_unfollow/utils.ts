import { QueryClient } from '@tanstack/react-query';
import projectsKeys from 'api/projects/keys';
import ideasKeys from 'api/ideas/keys';
import initiativesKeys from 'api/initiatives/keys';
import projectFoldersKeys from 'api/project_folders/keys';
import followUnfollowKeys from './keys';
import { FollowableType } from './types';

export const invalidateFollowQueries = (
  queryClient: QueryClient,
  followableType: FollowableType,
  followableId: string,
  followableSlug?: string
) => {
  queryClient.invalidateQueries({ queryKey: followUnfollowKeys.all() });
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
    default:
      break;
  }
};
