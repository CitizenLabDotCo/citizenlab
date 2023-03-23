import { IQueryParameters } from './types';

const ideasKeys = {
  all: () => [{ type: 'idea' }],
  lists: () => [{ ...ideasKeys.all()[0], operation: 'list' }],
  list: (filters: IQueryParameters) => [
    { ...ideasKeys.lists()[0], ...filters },
  ],
  items: () => [{ ...ideasKeys.all()[0], operation: 'item' }],
  item: (id?: string) => [
    {
      ...ideasKeys.items()[0],
      id,
    },
  ],
};

export default ideasKeys;
