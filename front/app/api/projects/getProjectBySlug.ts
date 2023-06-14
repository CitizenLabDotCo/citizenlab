import { queryClient } from 'utils/cl-react-query/queryClient';
import { fetchProjectBySlug } from './useProjectBySlug';
import projectsKeys from './keys';

const getProjectbySlug = (slug: string) => {
  return queryClient.fetchQuery(projectsKeys.item({ slug }), () =>
    fetchProjectBySlug({ slug })
  );
};

export default getProjectbySlug;
