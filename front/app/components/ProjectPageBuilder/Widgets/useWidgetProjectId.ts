import useProjectBySlug from 'api/projects/useProjectBySlug';

import { useParams } from 'utils/router';

// Widgets render both in the builder (route param `projectId`) and on the
// public project page (route param `slug`); resolves the id from whichever is
// present.
const useWidgetProjectId = () => {
  const { projectId, slug } = useParams({ strict: false }) as {
    projectId?: string;
    slug?: string;
  };
  const { data: project } = useProjectBySlug(slug);
  return projectId || project?.data.id;
};

export default useWidgetProjectId;
