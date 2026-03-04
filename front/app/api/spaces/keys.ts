import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'space',
};

const spacesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: any) => [{ ...baseKey, operation: 'list', parameters }],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default spacesKeys;
