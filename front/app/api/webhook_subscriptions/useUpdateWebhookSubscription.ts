import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import webhookSubscriptionKeys from './keys';
import { IWebhookSubscription, IWebhookSubscriptionUpdate } from './types';

const updateWebhookSubscription = async ({
  id,
  ...requestBody
}: IWebhookSubscriptionUpdate & { id: string }) =>
  fetcher<IWebhookSubscription>({
    path: `/webhook_subscriptions/${id}`,
    action: 'patch',
    body: { webhook_subscription: requestBody },
  });

const useUpdateWebhookSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IWebhookSubscription,
    CLErrorsWrapper,
    IWebhookSubscriptionUpdate & { id: string }
  >({
    mutationFn: updateWebhookSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: webhookSubscriptionKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: webhookSubscriptionKeys.items(),
      });
    },
  });
};

export default useUpdateWebhookSubscription;
