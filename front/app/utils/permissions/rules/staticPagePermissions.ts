import { IProjectData } from 'api/projects/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin } from '../roles';

import { canModerateProject } from './projectPermissions';

// Mirrors the backend StaticPagePolicy#update?: project pages are editable by
// the project's (or its folder's/space's) moderators and admins; global pages
// are admin-only. The scoping project comes in as context.
definePermissionRule(
  'static_page',
  'edit',
  (_page, user, _tenant, project?: IProjectData) =>
    project ? canModerateProject(project, user) : isAdmin(user)
);

// Mirrors the backend ContentBuilder::LayoutPolicy#update?: the homepage layout
// has no content_buildable, so the policy falls back to admin-only. Unlike
// static pages there is no scoping project, hence no moderator case.
definePermissionRule('homepage', 'edit', (_page, user) => {
  return isAdmin(user);
});
