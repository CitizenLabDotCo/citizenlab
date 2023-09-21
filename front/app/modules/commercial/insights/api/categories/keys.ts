import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'category',
};

const categoriesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ viewId }: { viewId: string }) => [
    { ...baseKey, operation: 'list', parameters: { viewId } },
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

export default categoriesKeys;
