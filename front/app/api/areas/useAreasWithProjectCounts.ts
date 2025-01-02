import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import areasKeys from './keys';
import { ProjectCountsByArea, AreasKeys } from './types';

const fetchProjectCountsByArea = () => {
  return fetcher<ProjectCountsByArea>({
    path: `/areas/with_visible_projects_counts`,
    action: 'get',
  });
};

const useProjectCountsByArea = () => {
  return useQuery<
    ProjectCountsByArea,
    CLErrors,
    ProjectCountsByArea,
    AreasKeys
  >({
    queryKey: areasKeys.list({ endpoint: 'with_visible_projects_counts' }),
    queryFn: () => fetchProjectCountsByArea(),
  });
};

export default useProjectCountsByArea;
