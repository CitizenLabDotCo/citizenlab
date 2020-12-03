import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';
import { IUser } from 'services/users';

export function isFolderModerator(user: IUser, folder: ?IProjectFolderData) {
  const { roles } = user.data.attributes;

  const adminPublicationRoles = roles?.filter(
    (role) => role.type === 'admin_publication_moderator'
  );

  if (!folder && adminPublicationRoles && adminPublicationRoles.length > 0) {
    return true;
  }

  const adminPublicationId = folder?.relationships.admin_publication?.data?.id;

  if (adminPublicationRoles && adminPublicationId) {
    return !!adminPublicationRoles?.find(
      (role) => role.admin_publication_id === adminPublicationId
    );
  }

  return false;
}
