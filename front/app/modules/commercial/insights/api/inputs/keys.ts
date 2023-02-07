import { InfiniteQueryParameters, QueryParameters } from './types';

const inputKeys = {
  all: () => [{ type: 'input' }],
  lists: () => [{ ...inputKeys.all()[0], entity: 'list' }],
  list: (viewId: string, filters?: QueryParameters) => [
    { ...inputKeys.all()[0], entity: 'list', viewId, ...filters },
  ],
  infiniteList: (viewId: string, filters?: InfiniteQueryParameters) => [
    {
      ...inputKeys.all()[0],
      ...filters,
      viewId,
      entity: 'list',
      queryType: 'infinite',
    },
  ],
  details: (viewId: string) => [
    { ...inputKeys.all()[0], viewId, entity: 'detail' },
  ],
  detail: (viewId: string, id: string) => [
    {
      ...inputKeys.details(viewId)[0],
      id,
    },
  ],
} as const;

export default inputKeys;
