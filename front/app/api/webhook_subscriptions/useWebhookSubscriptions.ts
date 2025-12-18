import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import webhookSubscriptionKeys from './keys';
import { IWebhookSubscriptions, WebhookSubscriptionKeys } from './types';

const fetchWebhookSubscriptions = ({
  pageNumber,
  pageSize,
}: {
  pageNumber?: number;
  pageSize?: number;
}) =>
  fetcher<IWebhookSubscriptions>({
    path: '/webhook_subscriptions',
    action: 'get',
    queryParams: {
      'page[number]': pageNumber,
      'page[size]': pageSize,
    },
  });

const useWebhookSubscriptions = (
  params: { pageNumber?: number; pageSize?: number } = {}
) => {
  return useQuery<
    IWebhookSubscriptions,
    CLErrors,
    IWebhookSubscriptions,
    WebhookSubscriptionKeys
  >({
    queryKey: webhookSubscriptionKeys.list(params),
    queryFn: () => fetchWebhookSubscriptions(params),
  });
};

export default useWebhookSubscriptions;
