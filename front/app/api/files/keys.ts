import { QueryKeys } from 'utils/cl-react-query/types';

import { QueryParameters } from './types';

const baseKey = {
  type: 'file',
};

const filesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: QueryParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string | null }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default filesKeys;
