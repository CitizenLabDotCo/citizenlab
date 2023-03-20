import { IIdeasFilterCountsQueryParameters } from './types';

const ideaFilterCountsKeys = {
  all: () => [{ type: 'ideas_filter_counts' }],
  items: () => [{ ...ideaFilterCountsKeys.all()[0], operation: 'item' }],
  item: (filters: IIdeasFilterCountsQueryParameters) => [
    { ...ideaFilterCountsKeys.items()[0], ...filters },
  ],
};

export default ideaFilterCountsKeys;
