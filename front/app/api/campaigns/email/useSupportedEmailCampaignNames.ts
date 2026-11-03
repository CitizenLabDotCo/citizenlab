import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import supportedCampaignNamesKeys from 'api/supported_campaign_names/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { CampaignContext } from '../types';

import { getEmailCampaignsContextPath } from './util';

interface ISupportedEmailCampaignNamesData {
  data: {
    type: string;
    attributes: string[];
  };
}

const fetchSupportedEmailCampaignNames = (context: CampaignContext = {}) => {
  return fetcher<ISupportedEmailCampaignNamesData>({
    path: `/${getEmailCampaignsContextPath(context)}/supported_campaign_names`,
    action: 'get',
  });
};

const useSupportedEmailCampaignNames = (
  context: CampaignContext = {}
): UseQueryResult<ISupportedEmailCampaignNamesData, CLErrors> => {
  return useQuery<ISupportedEmailCampaignNamesData, CLErrors>({
    queryKey: supportedCampaignNamesKeys.lists(context),
    queryFn: () => fetchSupportedEmailCampaignNames(context),
  });
};

export default useSupportedEmailCampaignNames;
