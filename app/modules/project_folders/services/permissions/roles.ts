import { IUser } from 'services/users';
import { isModerator, isAdmin } from 'services/permissions/roles';

export const isProjectFolderModerator = (
  user?: IUser | null,
  projectFolderId?: string | null
) => {
  return (
    isModerator(user) &&
    (!projectFolderId ||
      !!(
        user &&
        projectFolderId &&
        user.data.attributes?.roles &&
        user.data.attributes?.roles?.find(
          (r: any) => r.folder_id === projectFolderId
        )
      ))
  );
};

export const canModerate = (
  projectFolderId: string | null | undefined,
  user: IUser
) => isAdmin(user) || isProjectFolderModerator(user, projectFolderId);
