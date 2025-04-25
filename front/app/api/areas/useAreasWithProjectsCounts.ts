import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import areasKeys from './keys';
import {
  IAreasWithProjectsCounts,
  AreasKeys,
  IAreasWithProjectsCountsQueryParams,
} from './types';

const fetchAreasWithProjectsCounts = (
  queryParams: IAreasWithProjectsCountsQueryParams
) => {
  const { pageNumber, pageSize } = queryParams;
  return fetcher<IAreasWithProjectsCounts>({
    path: `/areas/with_visible_projects_counts`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 5000,
    },
  });
};

const useAreasWithProjectsCounts = (
  queryParams: IAreasWithProjectsCountsQueryParams = {}
) => {
  return useQuery<
    IAreasWithProjectsCounts,
    CLErrors,
    IAreasWithProjectsCounts,
    AreasKeys
  >({
    queryKey: areasKeys.list({ endpoint: 'with_visible_projects_counts' }),
    queryFn: () => fetchAreasWithProjectsCounts(queryParams),
  });
};

export default useAreasWithProjectsCounts;
