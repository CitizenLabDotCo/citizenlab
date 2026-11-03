import { queryClient } from 'utils/cl-react-query/queryClient';

import projectsKeys from './keys';
import { fetchProjectBySlug } from './useProjectBySlug';

const getProjectbySlug = (slug: string) => {
  return queryClient.fetchQuery({
    queryKey: projectsKeys.item({ slug }),
    queryFn: () => fetchProjectBySlug({ slug }),
  });
};

export default getProjectbySlug;
