import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import campaignsKeys from './keys';
import { ICampaignsData, QueryParameters, CampaignsKeys } from './types';

const fetchCampaigns = (filters: QueryParameters) => {
  const {
    campaignNames: campaign_names,
    withoutCampaignNames: without_campaign_names,
    pageNumber,
    pageSize,
  } = filters;
  return fetcher<ICampaignsData>({
    path: '/campaigns',
    action: 'get',
    queryParams: {
      campaign_names,
      without_campaign_names,
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 20,
    },
  });
};

const useCampaigns = (queryParams: QueryParameters) => {
  return useInfiniteQuery<
    ICampaignsData,
    CLErrors,
    ICampaignsData,
    CampaignsKeys
  >({
    queryKey: campaignsKeys.list(queryParams),
    queryFn: ({ pageParam }) =>
      fetchCampaigns({ ...queryParams, pageNumber: pageParam }),
    getNextPageParam: (lastPage) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);

      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
  });
};

export default useCampaigns;
