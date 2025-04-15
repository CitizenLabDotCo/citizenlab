import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';
import { IUser } from 'api/users/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin, isProjectModerator } from '../roles';

import { userModeratesFolder } from './projectFolderPermissions';

definePermissionRule('project', 'create', (_project: IProjectData, user) => {
  return isAdmin(user);
});

definePermissionRule('project', 'delete', (_project: IProjectData, user) => {
  return isAdmin(user);
});

definePermissionRule('project', 'reorder', (_project: IProjectData, user) => {
  return isAdmin(user);
});

definePermissionRule(
  'project',
  'publish',
  (project: IProjectData, user, _tenant) => {
    const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });
    const { data: projectReview } = useProjectReview(project.id);

    return (
      isAdmin(user) ||
      // We don't want any folder moderator,
      // hence the folder id needs to be defined so we can do a check for the particular folder
      (!!project.attributes.folder_id &&
        userModeratesFolder(user, project.attributes.folder_id)) ||
      (isProjectReviewEnabled &&
        projectReview?.data.attributes.state === 'approved' &&
        isProjectModerator(user, project.id))
    );
  }
);

export function canModerateProject(
  project: IProjectData,
  user: IUser | undefined
) {
  const projectId = project.id;
  const projectFolderId = project.attributes.folder_id;

  if (!user) return false;

  return (
    isAdmin(user) ||
    (typeof projectFolderId === 'string' &&
      userModeratesFolder(user, projectFolderId)) ||
    isProjectModerator(user, projectId)
  );
}

definePermissionRule('project', 'moderate', (project: IProjectData, user) => {
  return canModerateProject(project, user);
});
