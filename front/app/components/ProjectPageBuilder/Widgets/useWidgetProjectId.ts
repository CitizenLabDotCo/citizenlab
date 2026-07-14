import useProjectBySlug from 'api/projects/useProjectBySlug';

import { useParams } from 'utils/router';

const useWidgetProjectId = () => {
  const { projectId, slug } = useParams({ strict: false }) as {
    projectId?: string;
    slug?: string;
  };
  const { data: project } = useProjectBySlug(slug);
  return projectId || project?.data.id;
};

export default useWidgetProjectId;
