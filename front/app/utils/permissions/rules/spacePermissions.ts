import { definePermissionRule } from 'utils/permissions/permissions';
import { isAdmin } from 'utils/permissions/roles';

// Permission to add or remove projects and folders to/from a space.
// Only admins are allowed to manage the contents of a space.
definePermissionRule('space', 'manage_projects_and_folders', (_item, user) => {
  return isAdmin(user);
});
