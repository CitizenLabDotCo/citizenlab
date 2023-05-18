import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import campaignsKeys from './keys';
import { CampaignAdd, ICampaign } from './types';

const addCampaign = async (campaign: CampaignAdd) =>
  fetcher<ICampaign>({
    path: `/campaigns`,
    action: 'post',
    body: { campaign },
  });

const useAddCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation<ICampaign, CLErrors, CampaignAdd>({
    mutationFn: addCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignsKeys.lists() });
    },
  });
};

export default useAddCampaign;
