import { IQueryParameters } from './types';

const similarIdeasKeys = {
  all: () => [{ type: 'similar_idea' }],
  lists: () => [{ ...similarIdeasKeys.all()[0], operation: 'list' }],
  list: (filters: IQueryParameters) => [
    { ...similarIdeasKeys.lists()[0], ...filters },
  ],
};

export default similarIdeasKeys;
