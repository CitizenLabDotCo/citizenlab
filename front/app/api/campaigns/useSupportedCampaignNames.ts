import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { CampaignContext } from './types';
import { getCampaignsContextPath } from './util';

interface ISupportedCampaignNamesData {
  data: {
    type: string;
    attributes: string[];
  };
}

const fetchSupportedCampaignNames = (context: CampaignContext = {}) => {
  return fetcher<ISupportedCampaignNamesData>({
    path: `/${getCampaignsContextPath(context)}/supported_campaign_names`,
    action: 'get',
  });
};

const useSupportedCampaignNames = (
  context: CampaignContext = {}
): UseQueryResult<ISupportedCampaignNamesData, CLErrors> => {
  return useQuery<ISupportedCampaignNamesData, CLErrors>({
    queryKey: ['campaign', 'supported_campaign_names', context],
    queryFn: () => fetchSupportedCampaignNames(context),
  });
};

export default useSupportedCampaignNames;
