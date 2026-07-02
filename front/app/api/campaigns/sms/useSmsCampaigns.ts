import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import smsCampaignsKeys from './keys';
import {
  ISmsCampaignsData,
  SmsCampaignsQueryParameters,
  SmsCampaignsKeys,
} from './types';

const fetchSmsCampaigns = ({
  pageNumber,
  pageSize,
}: SmsCampaignsQueryParameters) =>
  fetcher<ISmsCampaignsData>({
    path: '/campaigns',
    action: 'get',
    queryParams: {
      manual: true,
      // SMS campaigns are the only manual campaigns that are not email. Until the
      // backend exposes a positive `channel` filter, exclude the email manual
      // campaigns to narrow the list to SMS.
      without_campaign_names: ['manual', 'manual_project_participants'],
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 20,
    },
  });

const useSmsCampaigns = (queryParams: SmsCampaignsQueryParameters = {}) => {
  return useInfiniteQuery<
    ISmsCampaignsData,
    CLErrors,
    ISmsCampaignsData,
    SmsCampaignsKeys
  >({
    queryKey: smsCampaignsKeys.list(queryParams),
    queryFn: ({ pageParam }) =>
      fetchSmsCampaigns({ ...queryParams, pageNumber: pageParam }),
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);

      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
  });
};

export default useSmsCampaigns;
