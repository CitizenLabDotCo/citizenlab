import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import webhookSubscriptionKeys from './keys';
import { IWebhookSubscriptionOnAdd, IWebhookSubscriptionAdd } from './types';

const addWebhookSubscription = async (requestBody: IWebhookSubscriptionAdd) =>
  fetcher<IWebhookSubscriptionOnAdd>({
    path: '/webhook_subscriptions',
    action: 'post',
    body: { webhook_subscription: requestBody },
  });

const useAddWebhookSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IWebhookSubscriptionOnAdd,
    CLErrorsWrapper,
    IWebhookSubscriptionAdd
  >({
    mutationFn: addWebhookSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: webhookSubscriptionKeys.lists(),
      });
    },
  });
};

export default useAddWebhookSubscription;
