import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import campaignKeys from './keys';
import { ICampaign } from './types';

const sendCampaignPreview = async (id: string) =>
  fetcher<ICampaign>({
    path: `/campaigns/${id}/send_preview`,
    action: 'post',
    body: {},
  });

const useSendCampaignPreview = () => {
  const queryClient = useQueryClient();
  return useMutation<ICampaign, CLErrors, string>({
    mutationFn: sendCampaignPreview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
};

export default useSendCampaignPreview;
