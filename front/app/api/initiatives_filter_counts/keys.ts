import { IQueryParameters } from './types';

const initiativeFilterCountsKeys = {
  all: () => [{ type: 'initiative' }],
  items: () => [{ ...initiativeFilterCountsKeys.all()[0], operation: 'item' }],
  item: (filters: IQueryParameters) => [
    { ...initiativeFilterCountsKeys.items()[0], ...filters },
  ],
};

export default initiativeFilterCountsKeys;
