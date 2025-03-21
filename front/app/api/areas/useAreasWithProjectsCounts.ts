import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import areasKeys from './keys';
import { IAreasWithProjectsCounts, AreasKeys } from './types';

const fetchAreasWithProjectsCounts = () => {
  return fetcher<IAreasWithProjectsCounts>({
    path: `/areas/with_visible_projects_counts`,
    action: 'get',
  });
};

const useAreasWithProjectsCounts = () => {
  return useQuery<
    IAreasWithProjectsCounts,
    CLErrors,
    IAreasWithProjectsCounts,
    AreasKeys
  >({
    queryKey: areasKeys.list({ endpoint: 'with_visible_projects_counts' }),
    queryFn: () => fetchAreasWithProjectsCounts(),
  });
};

export default useAreasWithProjectsCounts;
