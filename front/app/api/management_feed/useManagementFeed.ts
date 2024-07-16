import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import managementFeedKeys from './keys';
import { ManagementFeed, IQueryParameters, ManagementFeedKeys } from './types';

export const defaultPageSize = 20;

const fetchManagementFeed = ({
  pageNumber,
  pageSize,
  ...queryParams
}: IQueryParameters) =>
  fetcher<ManagementFeed>({
    path: `/activities`,
    action: 'get',
    queryParams: {
      sort: queryParams.sort ?? '-acted_at',
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || defaultPageSize,
      user_ids: queryParams.userIds,
      project_ids: queryParams.projectIds,
    },
  });

const useManagementFeed = (queryParams: IQueryParameters) => {
  return useQuery<ManagementFeed, CLErrors, ManagementFeed, ManagementFeedKeys>(
    {
      queryKey: managementFeedKeys.list(queryParams),
      queryFn: () => fetchManagementFeed(queryParams),
      staleTime: 0,
    }
  );
};

export default useManagementFeed;
