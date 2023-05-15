import { QueryKeys } from 'utils/cl-react-query/types';
import { ITopicsQueryParams } from './types';

const baseKey = { type: 'topics' };

const topicsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: ITopicsQueryParams) => [
    { ...baseKey, operation: 'list', parameters: params },
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

export default topicsKeys;
