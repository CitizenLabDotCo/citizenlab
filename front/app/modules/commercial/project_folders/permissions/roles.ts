import { isNilOrError } from 'utils/helperUtils';
import { IUserData, IRole } from 'services/users';
import { isAdmin } from 'services/permissions/roles';

declare module 'services/users' {
  type IProjectFolderModeratorRole = {
    type: 'project_folder_moderator';
    project_folder_id: string;
  };
}

export function moderatesFolder(
  user: IUserData | null,
  projectFolderId: string
) {
  if (isNilOrError(user)) {
    return false;
  }

  return (
    isAdmin({ data: user }) || isProjectFolderModerator(user, projectFolderId)
  );
}

export function isProjectFolderModerator(
  user: IUserData,
  projectFolderId?: string
) {
  return !!user.attributes?.roles?.find((role: IRole) => {
    if (projectFolderId) {
      return (
        role.type === 'project_folder_moderator' &&
        role.project_folder_id === projectFolderId
      );
    } else {
      return role.type === 'project_folder_moderator';
    }
  });
}
