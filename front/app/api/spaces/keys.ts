import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'space',
};

const spacesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: Record<string, string>) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id, type }: { id?: string; type?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id, type },
    },
  ],
} satisfies QueryKeys;

export default spacesKeys;
