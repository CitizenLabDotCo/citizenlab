import { InfiniteQueryParameters, QueryParameters } from './types';

const inputKeys = {
  all: () => [{ type: 'input' }] as const,
  lists: () => [{ ...inputKeys.all()[0], entity: 'list' }] as const,
  list: (viewId: string, filters?: QueryParameters) =>
    [{ ...inputKeys.all()[0], entity: 'list', viewId, ...filters }] as const,
  infiniteList: (viewId: string, filters?: InfiniteQueryParameters) =>
    [
      {
        ...inputKeys.all()[0],
        ...filters,
        viewId,
        entity: 'list',
        queryType: 'infinite',
      },
    ] as const,
  details: (viewId: string) =>
    [{ ...inputKeys.all()[0], viewId, entity: 'detail' }] as const,
  detail: (viewId: string, id: string) =>
    [
      {
        ...inputKeys.details(viewId)[0],
        id,
      },
    ] as const,
};

export default inputKeys;
