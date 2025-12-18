import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import webhookSubscriptionKeys from './keys';
import { IWebhookSubscription, WebhookSubscriptionKeys } from './types';

const fetchWebhookSubscription = (id: string) =>
  fetcher<IWebhookSubscription>({
    path: `/webhook_subscriptions/${id}`,
    action: 'get',
  });

const useWebhookSubscription = (id: string) => {
  return useQuery<
    IWebhookSubscription,
    CLErrors,
    IWebhookSubscription,
    WebhookSubscriptionKeys
  >({
    queryKey: webhookSubscriptionKeys.item({ id }),
    queryFn: () => fetchWebhookSubscription(id),
    enabled: !!id,
  });
};

export default useWebhookSubscription;
