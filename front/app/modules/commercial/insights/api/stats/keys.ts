import { QueryParameters } from './types';

const statsKeys = {
  all: () => [{ type: 'inputs_stat' }],
  items: () => [{ ...statsKeys.all()[0], operation: 'item' }],
  item: (viewId: string, filters?: QueryParameters) => [
    { ...statsKeys.all()[0], operation: 'item', viewId, ...filters },
  ],
} as const;

export default statsKeys;
