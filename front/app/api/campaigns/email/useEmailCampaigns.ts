import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import emailCampaignsKeys from './keys';
import {
  IEmailCampaignsData,
  EmailCampaignsQueryParameters,
  EmailCampaignsKeys,
} from './types';
import { getEmailCampaignsContextPath } from './util';

const fetchEmailCampaigns = (filters: EmailCampaignsQueryParameters) => {
  const {
    manual: manual,
    withoutCampaignNames: without_campaign_names,
    pageNumber,
    pageSize,
    context,
  } = filters;
  return fetcher<IEmailCampaignsData>({
    path: `/${getEmailCampaignsContextPath(context)}`,
    action: 'get',
    queryParams: {
      manual,
      channel: 'email',
      without_campaign_names,
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 20,
    },
  });
};

const useEmailCampaigns = (queryParams: EmailCampaignsQueryParameters) => {
  return useInfiniteQuery<
    IEmailCampaignsData,
    CLErrors,
    IEmailCampaignsData,
    EmailCampaignsKeys
  >({
    queryKey: emailCampaignsKeys.list(queryParams),
    queryFn: ({ pageParam }) =>
      fetchEmailCampaigns({ ...queryParams, pageNumber: pageParam }),
    // Should still be needed for pagination in CustomEmails
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);

      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
  });
};

export default useEmailCampaigns;
