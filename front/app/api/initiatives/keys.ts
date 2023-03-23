import { IQueryParameters } from './types';

const initiativesKeys = {
  all: () => [{ type: 'initiative' }],
  lists: () => [{ ...initiativesKeys.all()[0], operation: 'list' }],
  list: (filters: IQueryParameters) => [
    { ...initiativesKeys.lists()[0], ...filters },
  ],
  items: () => [{ ...initiativesKeys.all()[0], operation: 'item' }],
  item: (id?: string) => [
    {
      ...initiativesKeys.items()[0],
      id,
    },
  ],
};

export default initiativesKeys;
