import { useCallback } from 'react';

import useAddProjectFolderModerator from 'api/project_folder_moderators/useAddProjectFolderModerator';
import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';
import useAddSpaceModerator from 'api/space_moderators/useAddSpaceModerator';
import { IUser, IUserData } from 'api/users/types';

export type Resources = {
  type: 'project' | 'folder' | 'space';
  ids: string[];
};

const useAssignModerator = () => {
  const { mutateAsync: addProjectModerator } = useAddProjectModerator();
  const { mutateAsync: addFolderModerator } = useAddProjectFolderModerator();
  const { mutateAsync: addSpaceModerator } = useAddSpaceModerator();

  return useCallback(
    (user: IUserData, resources: Resources) => {
      const assignPMs = async () => {
        const promises: Promise<IUser>[] = [];

        for (const projectId of resources.ids) {
          promises.push(
            addProjectModerator({
              projectId,
              user_id: user.id,
            })
          );
        }

        await Promise.all(promises);
      };

      const assignFMs = async () => {
        const promises: Promise<IUser>[] = [];

        for (const folderId of resources.ids) {
          promises.push(
            addFolderModerator({
              projectFolderId: folderId,
              user_id: user.id,
            })
          );
        }

        await Promise.all(promises);
      };

      const assignSMs = async () => {
        const promises: Promise<IUser>[] = [];

        for (const spaceId of resources.ids) {
          promises.push(
            addSpaceModerator({
              spaceId,
              user_id: user.id,
            })
          );
        }

        await Promise.all(promises);
      };

      switch (resources.type) {
        case 'project':
          return assignPMs();
        case 'folder':
          return assignFMs();
        case 'space':
          return assignSMs();
        default:
          throw new Error('Unknown moderator type');
      }
    },
    [addProjectModerator, addFolderModerator, addSpaceModerator]
  );
};

export default useAssignModerator;
