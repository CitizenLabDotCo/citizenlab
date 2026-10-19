import { IProjectData } from 'api/projects/types';
import { IUser } from 'api/users/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin, isProjectModerator, isSpaceModerator } from '../roles';

import {
  isProjectFolderModerator,
  userModeratesFolder,
  userModeratesSpace,
} from './projectFolderPermissions';

definePermissionRule('project', 'create', (_project: IProjectData, user) => {
  return isAdmin(user);
});

definePermissionRule('project', 'delete', (_project: IProjectData, user) => {
  return isAdmin(user);
});

// Admins see every project in the admin list; everyone else only what they
// manage.
definePermissionRule('project', 'list_all_for_admin', (_project, user) =>
  isAdmin(user)
);

// Whoever reviews projects (somewhere) can look for the ones waiting for it.
definePermissionRule('project', 'list_pending_review', (_project, user) => {
  return (
    isAdmin(user) || isSpaceModerator(user) || isProjectFolderModerator(user)
  );
});

// Who can move a project among the items beside it, as on the backend: inside
// a folder, whoever moderates the folder; at the top, the space's managers.
// Pass where it sits via `context` (`{ folderId, spaceId }`).
export const canReorderProject = (
  user: IUser | undefined | null,
  { folderId, spaceId }: { folderId?: string | null; spaceId?: string | null }
) =>
  folderId
    ? userModeratesFolder(user, folderId, spaceId)
    : isAdmin(user) || userModeratesSpace(user, spaceId);

definePermissionRule('project', 'reorder', (_project, user, _tenant, context) =>
  canReorderProject(user, context ?? {})
);

// Who moves projects between spaces and folders from the projects page:
// admins, and space managers within their spaces. Pass the project's space
// via `context` (`{ spaceId }`).
definePermissionRule(
  'project',
  'move',
  (_project, user, _tenant, context) =>
    isAdmin(user) || userModeratesSpace(user, context?.spaceId)
);

const canReview = (project: IProjectData, user: IUser | undefined | null) => {
  if (isAdmin(user)) return true;

  if (project.attributes.folder_id) {
    return userModeratesFolder(user, project.attributes.folder_id);
  }

  if (project.attributes.space_id) {
    return userModeratesSpace(user, project.attributes.space_id);
  }

  return false;
};

definePermissionRule(
  'project',
  'review',
  (project: IProjectData, user, _tenant) => canReview(project, user)
);

definePermissionRule(
  'project',
  'publish',
  (project: IProjectData, user, _tenant, isProjectApproved: boolean) => {
    return (
      canReview(project, user) ||
      (isProjectApproved && isProjectModerator(user, project.id))
    );
  }
);

export function canModerateProject(
  project: IProjectData,
  user: IUser | undefined | null
) {
  const projectId = project.id;
  const folderId = project.attributes.folder_id;
  const spaceId = project.attributes.space_id;

  return canModerateProjectByIds({
    projectId,
    folderId,
    spaceId,
    user,
  });
}

export const canModerateProjectByIds = ({
  projectId,
  folderId,
  spaceId,
  user,
}: {
  projectId: string;
  folderId?: string | null;
  spaceId?: string | null;
  user: IUser | undefined | null;
}) => {
  if (!user) return false;

  return (
    isAdmin(user) ||
    (typeof spaceId === 'string' && userModeratesSpace(user, spaceId)) ||
    (typeof folderId === 'string' && userModeratesFolder(user, folderId)) ||
    isProjectModerator(user, projectId)
  );
};

definePermissionRule('project', 'moderate', (project: IProjectData, user) => {
  return canModerateProject(project, user);
});
