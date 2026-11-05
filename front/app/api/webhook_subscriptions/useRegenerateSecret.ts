import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import webhookSubscriptionKeys from './keys';
import { IWebhookSubscriptionOnAdd } from './types';

const regenerateSecret = (id: string) =>
  fetcher<IWebhookSubscriptionOnAdd>({
    path: `/webhook_subscriptions/${id}/regenerate_secret`,
    action: 'post',
    body: null,
  });

const useRegenerateSecret = () => {
  const queryClient = useQueryClient();
  return useMutation<IWebhookSubscriptionOnAdd, CLErrorsWrapper, string>({
    mutationFn: regenerateSecret,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: webhookSubscriptionKeys.item({ id }),
      });
      queryClient.invalidateQueries({
        queryKey: webhookSubscriptionKeys.lists(),
      });
    },
  });
};

export default useRegenerateSecret;
