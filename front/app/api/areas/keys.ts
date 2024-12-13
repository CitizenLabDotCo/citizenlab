import { QueryKeys } from 'utils/cl-react-query/types';

import { IAreasQueryParams } from './types';

const baseKey = { type: 'area' };

const areasKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: IAreasQueryParams | { endpoint: 'count_by_area' }) => [
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

export default areasKeys;
