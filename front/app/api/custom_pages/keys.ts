import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'static_page' };

const customPagesKeys = {
  all: () => [baseKey],
  lists: (params?: { projectId?: string }) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id, slug }: { id?: string; slug?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id, slug },
    },
  ],
} satisfies QueryKeys;

export default customPagesKeys;
