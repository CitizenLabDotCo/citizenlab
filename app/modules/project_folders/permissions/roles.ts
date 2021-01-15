import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';
import { IUserData } from 'services/users';

export type IProjectFolderModerator = {
  type: 'project_folder_moderator';
  project_folder_id: string;
};

export const isProjectFolderModerator = (
  user?: IUserData | null,
  projectFolderId?: IProjectFolderData['id'] | null
) => {
  return !!(
    user &&
    user.attributes?.roles &&
    user.attributes?.roles?.find((role) => {
      if (projectFolderId) {
        return (
          role.project_folder_id === projectFolderId &&
          role.type === 'project_folder_moderator'
        );
      }

      return r.type === 'project_folder_moderator';
    })
  );
};
