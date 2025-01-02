import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import areasKeys from './keys';
import { AreasWithProjectsCounts, AreasKeys } from './types';

const fetchAreasWithProjectsCounts = () => {
  return fetcher<AreasWithProjectsCounts>({
    path: `/areas/with_visible_projects_counts`,
    action: 'get',
  });
};

const useAreasWithProjectsCounts = () => {
  return useQuery<
    AreasWithProjectsCounts,
    CLErrors,
    AreasWithProjectsCounts,
    AreasKeys
  >({
    queryKey: areasKeys.list({ endpoint: 'with_visible_projects_counts' }),
    queryFn: () => fetchAreasWithProjectsCounts(),
  });
};

export default useAreasWithProjectsCounts;
