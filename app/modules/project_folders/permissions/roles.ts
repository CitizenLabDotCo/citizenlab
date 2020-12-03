import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';
import { IUser } from 'services/users';

export const isAdminPublicationModerator = (
  user?: IUser | null,
  projectFolderId?: IAdminPublicationData['id'] | null
) => {
  return (
    isModerator(user) &&
    (!projectFolderId ||
      !!(
        user &&
        projectFolderId &&
        user.data.attributes?.roles &&
        user.data.attributes?.roles?.find(
          (r: IAdminPublicationModerator) =>
            r.admin_publication_id === projectFolderId
        )
      ))
  );
};
