import { QueryKeys } from 'utils/cl-react-query/types';

import { Query } from './types';

const baseKey = { type: 'analytics' };

const analyticsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (query: Query) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { ...query },
    },
  ],
} satisfies QueryKeys;

export default analyticsKeys;
