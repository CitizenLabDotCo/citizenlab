import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'webhook_delivery' };

const webhookDeliveryKeys = {
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

export default webhookDeliveryKeys;
