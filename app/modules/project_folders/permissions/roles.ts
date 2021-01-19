import { IUserData, IRole } from 'services/users';
import { isAdmin } from 'services/permissions/roles';

export type IProjectFolderModerator = {
  type: 'project_folder_moderator';
  project_folder_id: string;
};

export function isProjectFolderModerator(
  user: IUserData,
  projectFolderId?: string
) {
  if (isAdmin({ data: user })) {
    return true;
  } else {
    return !!user.attributes?.roles?.find(
      (role: IRole | IProjectFolderModerator) => {
        if (projectFolderId) {
          return (
            role.type === 'project_folder_moderator' &&
            role.project_folder_id === projectFolderId
          );
        }

        return role.type === 'project_folder_moderator';
      }
    );
  }
}

export function hasProjectFolderModeratorRole(user: IUserData) {
  return !!user.attributes.roles?.find(
    (role: IRole | IProjectFolderModerator) =>
      role.type === 'project_folder_moderator'
  );
}
