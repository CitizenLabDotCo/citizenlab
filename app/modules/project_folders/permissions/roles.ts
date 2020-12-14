import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';
import { IUser } from 'services/users';

export type IProjectFolderModerator = {
  type: 'project_folder_moderator';
  project_folder_id: string;
};

export const isProjectFolderModerator = (
  user?: IUser | null,
  projectFolderId?: IProjectFolderData['id'] | null
) => {
  return !!(
    user &&
    user.data.attributes?.roles &&
    user.data.attributes?.roles?.find((r: IProjectFolderModerator) => {
      if (projectFolderId) {
        return (
          r.project_folder_id === projectFolderId &&
          r.type === 'project_folder_moderator'
        );
      }

      return r.type === 'project_folder_moderator';
    })
  );
};
