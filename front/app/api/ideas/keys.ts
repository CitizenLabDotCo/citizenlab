import { IQueryParameters } from './types';

const ideasKeys = {
  all: () => [{ type: 'idea' }],
  lists: () => [{ ...ideasKeys.all()[0], operation: 'list' }],
  list: (filters: IQueryParameters) => [
    { ...ideasKeys.lists()[0], ...filters },
  ],
  infiniteList: (filters: IQueryParameters) => [
    { ...ideasKeys.lists()[0], queryType: 'infinite', ...filters },
  ],
  items: () => [{ ...ideasKeys.all()[0], operation: 'item' }],
  itemId: (id?: string) => [
    {
      ...ideasKeys.items()[0],
      id,
    },
  ],
  itemSlug: (slug?: string) => [
    {
      ...ideasKeys.items()[0],
      slug,
    },
  ],
};

export default ideasKeys;
