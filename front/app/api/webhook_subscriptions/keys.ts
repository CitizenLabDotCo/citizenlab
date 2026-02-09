import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'webhook_subscription' };

const webhookSubscriptionKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: Record<string, any>) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (params: Record<string, any>) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default webhookSubscriptionKeys;
