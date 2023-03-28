import { IQueryParameters } from './types';

const initiativeFilterCountsKeys = {
  all: () => [{ type: 'filter_counts', variant: 'initiative' }],
  items: () => [{ ...initiativeFilterCountsKeys.all()[0], operation: 'item' }],
  item: (filters: IQueryParameters) => [
    { ...initiativeFilterCountsKeys.items()[0], ...filters },
  ],
};

export default initiativeFilterCountsKeys;
