import { IUserData, IRole } from 'services/users';
import { isAdmin } from 'services/permissions/roles';

declare module 'services/users' {
  type IProjectFolderModeratorRole = {
    type: 'project_folder_moderator';
    project_folder_id: string;
  };
}

export function isProjectFolderModerator(
  user: IUserData,
  projectFolderId?: string
) {
  if (isAdmin({ data: user })) {
    return true;
  } else {
    return !!user.attributes?.roles?.find((role: IRole) => {
      if (projectFolderId) {
        return (
          role.type === 'project_folder_moderator' &&
          role.project_folder_id === projectFolderId
        );
      }

      return role.type === 'project_folder_moderator';
    });
  }
}
