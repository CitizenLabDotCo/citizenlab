import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsCampaignsKeys from './keys';
import { ISmsCampaign, ISmsCampaignAdd } from './types';

const addSmsCampaign = async (requestBody: ISmsCampaignAdd) =>
  fetcher<ISmsCampaign>({
    path: '/campaigns',
    action: 'post',
    body: { campaign: { campaign_name: 'sms_manual', ...requestBody } },
  });

const useAddSmsCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<ISmsCampaign, CLErrors, ISmsCampaignAdd>({
    mutationFn: addSmsCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsCampaignsKeys.lists() });
    },
  });
};

export default useAddSmsCampaign;
