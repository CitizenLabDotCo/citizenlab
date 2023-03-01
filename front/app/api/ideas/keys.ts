import { IQueryParameters } from './types';

const ideaKeys = {
  all: () => [{ type: 'idea' }],
  lists: () => [{ ...ideaKeys.all()[0], operation: 'list' }],
  list: (filters: IQueryParameters) => [{ ...ideaKeys.lists()[0], ...filters }],
  infiniteList: (filters: IQueryParameters) => [
    { ...ideaKeys.lists()[0], queryType: 'infinite', ...filters },
  ],
  items: () => [{ ...ideaKeys.all()[0], operation: 'item' }],
  item: (id: string) => [
    {
      ...ideaKeys.items()[0],
      id,
    },
  ],
};

export default ideaKeys;
