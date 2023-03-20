import { IQueryParameters } from './types';

const initiativeFilterCountsKeys = {
  all: () => [{ type: 'initiatives_filter_counts' }],
  items: () => [{ ...initiativeFilterCountsKeys.all()[0], operation: 'item' }],
  item: (filters: IQueryParameters) => [
    { ...initiativeFilterCountsKeys.items()[0], ...filters },
  ],
};

export default initiativeFilterCountsKeys;
