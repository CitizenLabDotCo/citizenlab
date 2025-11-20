import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import webhookDeliveryKeys from './keys';
import { IWebhookDelivery } from './types';

const replayDelivery = (id: string) =>
  fetcher<IWebhookDelivery>({
    path: `/webhook_deliveries/${id}/replay`,
    action: 'post',
    body: null,
  });

const useReplayDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation<IWebhookDelivery, CLErrorsWrapper, string>({
    mutationFn: replayDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: webhookDeliveryKeys.lists(),
      });
    },
  });
};

export default useReplayDelivery;
