import { QueryClient } from '@tanstack/react-query';
import projectsKeys from 'api/projects/keys';
import ideasKeys from 'api/ideas/keys';
import initiativesKeys from 'api/initiatives/keys';
import projectFoldersKeys from 'api/project_folders/keys';
import followUnfollowKeys from './keys';

export const invalidateFollowQueries = (
  queryClient: QueryClient,
  followableType: string,
  followableId: string
) => {
  queryClient.invalidateQueries({ queryKey: followUnfollowKeys.all() });
  switch (followableType) {
    case 'projects':
      queryClient.invalidateQueries(projectsKeys.item({ id: followableId }));
      break;
    case 'ideas':
      queryClient.invalidateQueries(ideasKeys.item({ id: followableId }));
      break;
    case 'proposals':
      queryClient.invalidateQueries(initiativesKeys.item({ id: followableId }));
      break;
    case 'folders':
      queryClient.invalidateQueries(
        projectFoldersKeys.item({ id: followableId })
      );
      break;
    default:
      break;
  }
};
