import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import webhookDeliveryKeys from './keys';
import { IWebhookDelivery, WebhookDeliveryKeys } from './types';

const fetchWebhookDelivery = (id: string) =>
  fetcher<IWebhookDelivery>({
    path: `/webhook_deliveries/${id}`,
    action: 'get',
  });

const useWebhookDelivery = (id: string) => {
  return useQuery<
    IWebhookDelivery,
    CLErrors,
    IWebhookDelivery,
    WebhookDeliveryKeys
  >({
    queryKey: webhookDeliveryKeys.item({ id }),
    queryFn: () => fetchWebhookDelivery(id),
    enabled: !!id,
  });
};
// ts-prune-ignore-next
export default useWebhookDelivery;
