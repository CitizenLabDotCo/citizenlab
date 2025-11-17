import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import webhookSubscriptionKeys from './keys';

const deleteWebhookSubscription = (id: string) =>
  fetcher({
    path: `/webhook_subscriptions/${id}`,
    action: 'delete',
  });

const useDeleteWebhookSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWebhookSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: webhookSubscriptionKeys.lists(),
      });
    },
  });
};

export default useDeleteWebhookSubscription;
