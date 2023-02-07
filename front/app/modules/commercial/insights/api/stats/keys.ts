import { QueryParameters } from './types';

const statsKeys = {
  all: () => [{ type: 'inputs_stat' }],
  details: () => [{ ...statsKeys.all()[0], entity: 'detail' }],
  detail: (viewId: string, filters?: QueryParameters) => [
    { ...statsKeys.all()[0], entity: 'detail', viewId, ...filters },
  ],
} as const;

export default statsKeys;
