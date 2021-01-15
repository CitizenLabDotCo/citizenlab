import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';
import { IUserData, IRole } from 'services/users';

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
    user.attributes?.roles?.find((role: IRole | IProjectFolderModerator) => {
      if (projectFolderId) {
        return (
          role.type === 'project_folder_moderator' &&
          role.project_folder_id === projectFolderId
        );
      }

      return role.type === 'project_folder_moderator';
    })
  );
};
