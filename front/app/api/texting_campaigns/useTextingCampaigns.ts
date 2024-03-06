import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import eventsKeys from './keys';
import { ITextingCampaigns, TextingCampaignsKeys } from './types';

const fetchTextingCampaigns = () => {
  return fetcher<ITextingCampaigns>({
    path: '/texting_campaigns',
    action: 'get',
  });
};

const useTextingCampaigns = () => {
  return useQuery<
    ITextingCampaigns,
    CLErrors,
    ITextingCampaigns,
    TextingCampaignsKeys
  >({
    queryKey: eventsKeys.lists(),
    queryFn: () => fetchTextingCampaigns(),
  });
};

export default useTextingCampaigns;
