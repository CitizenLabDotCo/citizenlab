import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsCampaignsKeys from './keys';
import { ISmsCampaign, SmsCampaignsKeys } from './types';

const fetchSmsCampaign = ({ campaignId }: { campaignId: string }) =>
  fetcher<ISmsCampaign>({
    path: `/campaigns/${campaignId}`,
    action: 'get',
  });

const useSmsCampaign = (campaignId: string) => {
  return useQuery<ISmsCampaign, CLErrors, ISmsCampaign, SmsCampaignsKeys>({
    queryKey: smsCampaignsKeys.item({ campaignId }),
    queryFn: () => fetchSmsCampaign({ campaignId }),
  });
};

export default useSmsCampaign;
