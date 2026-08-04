import { definePermissionRule } from 'utils/permissions/permissions';
import { isAdmin, isSpaceModerator } from 'utils/permissions/roles';
import { userModeratesSpace } from 'utils/permissions/rules/projectFolderPermissions';

// Permission to add projects and folders to a space. Admins and moderators of
// the space are allowed to manage its contents. Without a context this is a
// general check (moderator of any space); with a context, `spaceId` must be
// present — asking about a specific space that isn't there fails closed.
definePermissionRule(
  'space',
  'manage_projects_and_folders',
  (_item, user, _tenant, context) => {
    if (context) return userModeratesSpace(user, context.spaceId);
    return isAdmin(user) || isSpaceModerator(user);
  }
);

// Permission to remove projects and folders from a space. Only admins are
// allowed to do this.
definePermissionRule('space', 'remove_projects_and_folders', (_item, user) => {
  return isAdmin(user);
});
