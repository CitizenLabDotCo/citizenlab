import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignKeys from './keys';
import { ICampaign, CampaignAdd } from './types';

const addCampaign = async (requestBody: CampaignAdd) =>
  fetcher<ICampaign>({
    path: '/campaigns',
    action: 'post',
    body: { campaign: requestBody },
  });

const useAddCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<ICampaign, CLErrors, CampaignAdd>({
    mutationFn: addCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
};

export default useAddCampaign;
