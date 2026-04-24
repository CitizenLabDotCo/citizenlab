import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'admin_publication' };

const adminPublicationsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: Record<string, any>) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id, type }: { id: string | null; type?: 'tree_view' }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id, type },
    },
  ],
} satisfies QueryKeys;

export default adminPublicationsKeys;
