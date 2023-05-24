import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
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
      'page[number]': pageNumber,
      'page[size]': pageSize,
    },
  });
};

const useCampaigns = (queryParams: QueryParameters) => {
  return useQuery<ICampaignsData, CLErrors, ICampaignsData, CampaignsKeys>({
    queryKey: campaignsKeys.list(queryParams),
    queryFn: () => fetchCampaigns(queryParams),
  });
};

export default useCampaigns;
