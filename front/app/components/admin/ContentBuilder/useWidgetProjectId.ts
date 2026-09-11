import useProjectBySlug from 'api/projects/useProjectBySlug';

import { useLocation, useParams } from 'utils/router';

// The builder routes carry the project's id; the project's front office carries its slug. A
// `slug` param exists on other routes too — a custom page's `/pages/:slug` — where it is not a
// project's, so the lookup is limited to project routes.
const useWidgetProjectId = () => {
  const { projectId, slug } = useParams({ strict: false }) as {
    projectId?: string;
    slug?: string;
  };
  const { pathname } = useLocation();
  const projectSlug = pathname.includes('/projects/') ? slug : undefined;
  const { data: project } = useProjectBySlug(projectSlug);
  return projectId || project?.data.id;
};

export default useWidgetProjectId;
