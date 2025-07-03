import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { ICampaignsData, QueryParameters, CampaignsKeys } from './types';

type PhaseCampaignsParams = QueryParameters & {
  phaseId: string;
};

const fetchCampaigns = ({ phaseId, ...filters }: PhaseCampaignsParams) => {
  const {
    withoutCampaignNames: without_campaign_names,
    pageNumber,
    pageSize,
  } = filters;
  return fetcher<ICampaignsData>({
    path: `/phases/${phaseId}/campaigns`,
    action: 'get',
    queryParams: {
      without_campaign_names,
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 20,
    },
  });
};

const usePhaseCampaigns = (params: PhaseCampaignsParams) => {
  return useQuery<ICampaignsData, CLErrors, ICampaignsData, CampaignsKeys>({
    queryFn: () => fetchCampaigns(params),
  });
};

export default usePhaseCampaigns;
