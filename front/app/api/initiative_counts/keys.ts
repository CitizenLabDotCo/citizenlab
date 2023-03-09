import { IQueryParameters } from './types';

const initiativesCountKeys = {
  all: () => [{ type: 'initiatives_count' }],
  items: () => [{ ...initiativesCountKeys.all()[0], operation: 'item' }],
  item: (filters?: IQueryParameters) => [
    { ...initiativesCountKeys.all()[0], operation: 'item', ...filters },
  ],
} as const;

export default initiativesCountKeys;
