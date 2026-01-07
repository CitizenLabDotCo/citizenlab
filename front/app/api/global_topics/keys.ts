import { QueryKeys } from 'utils/cl-react-query/types';

import { IGlobalTopicsQueryParams } from './types';

const baseKey = { type: 'global_topic' };

const globalTopicsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: IGlobalTopicsQueryParams) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default globalTopicsKeys;
