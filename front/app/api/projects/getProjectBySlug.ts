import { queryClient } from 'utils/cl-react-query/queryClient';

import projectsKeys from './keys';
import { fetchProjectBySlug } from './useProjectBySlug';

const getProjectbySlug = (slug: string) => {
  return queryClient.fetchQuery(projectsKeys.item({ slug }), () =>
    fetchProjectBySlug({ slug })
  );
};

export default getProjectbySlug;
