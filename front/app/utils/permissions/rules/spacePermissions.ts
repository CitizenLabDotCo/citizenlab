import { definePermissionRule } from 'utils/permissions/permissions';
import { isAdmin, isSpaceModerator } from 'utils/permissions/roles';

// Permission to add projects and folders to a space. Admins and moderators of
// the space are allowed to manage its contents.
definePermissionRule(
  'space',
  'manage_projects_and_folders',
  (_item, user, _tenant, context) => {
    return isAdmin(user) || isSpaceModerator(user, context?.spaceId);
  }
);

// Permission to remove projects and folders from a space. Only admins are
// allowed to do this.
definePermissionRule('space', 'remove_projects_and_folders', (_item, user) => {
  return isAdmin(user);
});
