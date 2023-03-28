import { QueryKeys } from 'utils/cl-react-query/types';
import { InfiniteQueryParameters, QueryParameters } from './types';

const baseKey = {
  type: 'input',
};

const inputsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({
    viewId,
    filters,
  }: {
    viewId: string;
    filters?: QueryParameters | InfiniteQueryParameters;
  }) => [
    {
      ...baseKey,
      operation: 'list',
      viewId,
      parameters: { viewId, ...filters },
    },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ viewId, id }: { viewId: string; id?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id, viewId },
    },
  ],
} satisfies QueryKeys;

export default inputsKeys;
