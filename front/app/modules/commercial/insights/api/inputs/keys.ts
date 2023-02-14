import { InfiniteQueryParameters, QueryParameters } from './types';

const inputsKeys = {
  all: () => [{ type: 'input' }],
  lists: () => [{ ...inputsKeys.all()[0], operation: 'list' }],
  list: (viewId: string, filters?: QueryParameters) => [
    { ...inputsKeys.all()[0], operation: 'list', viewId, ...filters },
  ],
  infiniteList: (viewId: string, filters?: InfiniteQueryParameters) => [
    {
      ...inputsKeys.all()[0],
      ...filters,
      viewId,
      operation: 'list',
      queryType: 'infinite',
    },
  ],
  items: (viewId: string) => [
    { ...inputsKeys.all()[0], viewId, operation: 'item' },
  ],
  item: (viewId: string, id: string) => [
    {
      ...inputsKeys.items(viewId)[0],
      id,
    },
  ],
} as const;

export default inputsKeys;
