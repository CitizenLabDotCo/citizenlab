import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'initiative_status',
};

const initiativeStatusesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default initiativeStatusesKeys;
