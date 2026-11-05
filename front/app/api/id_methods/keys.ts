import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'id_method' };

const idMethodsKeys = {
  all: () => [baseKey],
  list: () => [{ ...baseKey, operation: 'list', parameters: {} }],
  item: ({ endpoint }: { endpoint: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: {
        endpoint,
      },
    },
  ],
} satisfies QueryKeys;

export default idMethodsKeys;
