import { QueryKeys } from 'utils/cl-react-query/types';

const baseViewsKey = { type: 'view' };

const viewsKeys = {
  all: () => [baseViewsKey],
  lists: () => [{ ...baseViewsKey, operation: 'list' }],
  items: () => [{ ...baseViewsKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    {
      ...baseViewsKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default viewsKeys;
