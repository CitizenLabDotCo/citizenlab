import { InfiniteQueryParameters, QueryParameters } from './types';

const inputsKeys = {
  all: () => [{ type: 'input' }],
  lists: () => [{ ...inputsKeys.all()[0], entity: 'list' }],
  list: (viewId: string, filters?: QueryParameters) => [
    { ...inputsKeys.all()[0], entity: 'list', viewId, ...filters },
  ],
  infiniteList: (viewId: string, filters?: InfiniteQueryParameters) => [
    {
      ...inputsKeys.all()[0],
      ...filters,
      viewId,
      entity: 'list',
      queryType: 'infinite',
    },
  ],
  details: (viewId: string) => [
    { ...inputsKeys.all()[0], viewId, entity: 'detail' },
  ],
  detail: (viewId: string, id: string) => [
    {
      ...inputsKeys.details(viewId)[0],
      id,
    },
  ],
} as const;

export default inputsKeys;
