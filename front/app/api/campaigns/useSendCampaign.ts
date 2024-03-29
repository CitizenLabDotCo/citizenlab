import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignKeys from './keys';
import { ICampaign } from './types';

const sendCampaign = async (id: string) =>
  fetcher<ICampaign>({
    path: `/campaigns/${id}/send`,
    action: 'post',
    body: {},
  });

const useSendCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<ICampaign, CLErrors, string>({
    mutationFn: sendCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all() });
    },
  });
};

export default useSendCampaign;
