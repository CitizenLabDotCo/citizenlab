import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import { useLocation, useParams } from 'utils/router';

// The builder routes carry the project's id; the project's front office carries its slug. A
// `slug` param exists on other routes too — a custom page's `/pages/:slug` — where it is not a
// project's, so the lookup is limited to project routes. A project's own page is edited in the
// custom page builder, whose route names only the page, so there the project comes from the page.
const useWidgetProjectId = () => {
  const { projectId, slug, customPageId } = useParams({ strict: false });
  const { pathname } = useLocation();
  const projectSlug = pathname.includes('/projects/') ? slug : undefined;
  const { data: project } = useProjectBySlug(projectSlug);
  const { data: customPage } = useCustomPageById(
    projectId ? undefined : customPageId
  );
  return (
    projectId || customPage?.data.attributes.project_id || project?.data.id
  );
};

export default useWidgetProjectId;
