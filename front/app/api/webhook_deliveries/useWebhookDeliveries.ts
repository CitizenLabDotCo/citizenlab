import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import webhookDeliveryKeys from './keys';
import { IWebhookDeliveries, WebhookDeliveryKeys } from './types';

const fetchWebhookDeliveries = ({
  subscriptionId,
  pageNumber,
  pageSize,
}: {
  subscriptionId: string;
  pageNumber?: number;
  pageSize?: number;
}) =>
  fetcher<IWebhookDeliveries>({
    path: `/webhook_subscriptions/${subscriptionId}/webhook_deliveries`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber,
      'page[size]': pageSize,
    },
  });

const useWebhookDeliveries = (params: {
  subscriptionId: string;
  pageNumber?: number;
  pageSize?: number;
}) => {
  return useQuery<
    IWebhookDeliveries,
    CLErrors,
    IWebhookDeliveries,
    WebhookDeliveryKeys
  >({
    queryKey: webhookDeliveryKeys.list(params),
    queryFn: () => fetchWebhookDeliveries(params),
    enabled: !!params.subscriptionId,
    refetchInterval(data) {
      return data?.data.some(
        (delivery) => delivery.attributes.status === 'pending'
      )
        ? 5000
        : false;
    },
  });
};

export default useWebhookDeliveries;
