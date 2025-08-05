import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import campaignsKeys from './keys';
import { ICampaignsData, QueryParameters, CampaignsKeys } from './types';
import { getCampaignsContextPath } from './util';

const fetchCampaigns = (filters: QueryParameters) => {
  const {
    manual: manual,
    withoutCampaignNames: without_campaign_names,
    pageNumber,
    pageSize,
    context,
  } = filters;
  return fetcher<ICampaignsData>({
    path: `/${getCampaignsContextPath(context)}`,
    action: 'get',
    queryParams: {
      manual,
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
    // Should still be needed for pagination in CustomEmails
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);

      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
  });
};

export default useCampaigns;
