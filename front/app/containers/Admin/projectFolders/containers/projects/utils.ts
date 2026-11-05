import { IAdminPublicationData } from 'api/admin_publications/types';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';
import { IUser } from 'api/users/types';

import { isAdmin } from 'utils/permissions/roles';

export const getAdminPublicationsThatCanBeAdded = (
  spaceId: string | null,
  adminPublications: IAdminPublicationData[] | undefined,
  projects: ProjectMiniAdminData[] | undefined,
  authUser: IUser | undefined
) => {
  if (!adminPublications || !projects) {
    return [];
  }

  if (isAdmin(authUser)) {
    return adminPublications.filter(isProjectNotInFolder);
  }

  // If the user is not an admin, they must be a space moderator
  // In this case, we only want the admin publications that
  // 1. are in the same space as the folder
  // 2. are not already in a folder

  // First, a quick type guard to make sure spaceId is not null (it should not be)
  if (!spaceId) {
    return [];
  }

  return adminPublications.filter(isProjectNotInFolder).filter((item) => {
    const projectId = item.relationships.publication.data.id;
    const project = projects.find((project) => project.id === projectId);

    if (!project) {
      return false;
    }

    const isInSameSpace = project.relationships.space?.data?.id === spaceId;

    return isInSameSpace;
  });
};

const isProjectNotInFolder = (adminPublication: IAdminPublicationData) => {
  return (
    adminPublication.relationships.publication.data.type === 'project' &&
    adminPublication.attributes.depth === 0
  );
};
