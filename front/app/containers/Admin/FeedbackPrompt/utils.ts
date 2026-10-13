import { getRoutePattern } from 'utils/getRoutePattern';

export const MIN_PROJECT_VISIT_MS = 30 * 1000;
const PROJECT_EXIT_KEY = 'feedback_prompt_project_exit';

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

const isProjectPage = (value: unknown): value is ProjectPage =>
  typeof value === 'object' &&
  value !== null &&
  'projectId' in value &&
  typeof value.projectId === 'string' &&
  'adminArea' in value &&
  typeof value.adminArea === 'string';

export const saveProjectExit = ({ projectId, adminArea }: ProjectPage) => {
  try {
    sessionStorage.setItem(
      PROJECT_EXIT_KEY,
      JSON.stringify({ projectId, adminArea })
    );
  } catch {
    return;
  }
};

export const takeProjectExit = (): ProjectPage | null => {
  try {
    const stored = sessionStorage.getItem(PROJECT_EXIT_KEY);
    sessionStorage.removeItem(PROJECT_EXIT_KEY);
    const exit: unknown = stored ? JSON.parse(stored) : null;
    return isProjectPage(exit) ? exit : null;
  } catch {
    return null;
  }
};
