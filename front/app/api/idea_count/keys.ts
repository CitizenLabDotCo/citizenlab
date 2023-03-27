import { IQueryParameters } from './types';

const ideasCountKeys = {
  all: () => [{ type: 'ideas_count' }],
  items: () => [{ ...ideasCountKeys.all()[0], operation: 'item' }],
  item: (filters?: IQueryParameters) => [
    { ...ideasCountKeys.all()[0], operation: 'item', ...filters },
  ],
} as const;

export default ideasCountKeys;
