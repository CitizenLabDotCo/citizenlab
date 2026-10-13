import { getRoutePattern } from 'utils/getRoutePattern';

// Leaving a project's back office only counts as the end of a visit after this
// long, so passing through a project doesn't trigger a prompt.
export const MIN_PROJECT_VISIT_MS = 30 * 1000;

export interface ProjectPage {
  projectId: string;
  adminArea: string;
}

export const getAdminArea = (path: string) => {
  // Index routes end in a slash, e.g. '/:locale/admin/projects/:projectId/general/'.
  const pattern = getRoutePattern(path)?.replace(/\/$/, '');
  return pattern?.startsWith('/:locale/admin') ? pattern : undefined;
};

export const getProjectPage = (path: string): ProjectPage | null => {
  const adminArea = getAdminArea(path);
  if (!adminArea?.startsWith('/:locale/admin/projects/:projectId')) return null;

  const projectIdIndex = adminArea.split('/').indexOf(':projectId');
  return { projectId: path.split('/')[projectIdIndex], adminArea };
};
